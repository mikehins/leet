<?php

namespace App\Http\Controllers;

use App\Enums\Difficulty;
use App\Enums\Grade;
use App\Events\CompetitionInvite;
use App\Events\GameEnded;
use App\Events\GameStarted;
use App\Events\PlayerAnswered;
use App\Events\RoundStarted;
use App\Models\CompetitiveGame;
use App\Models\CompetitiveGameAnswer;
use App\Models\CompetitiveGameRound;
use App\Models\Problem;
use App\Services\ProblemGenerator;
use App\Services\ReportSuggestedProgressService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompetitiveGameController extends Controller
{
    public function __construct(
        private ProblemGenerator $generator,
        private ReportSuggestedProgressService $reportProgressService
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();
        $suggestedPractice = $this->reportProgressService->getActiveSuggestedPractice($user);
        $hasCompletedSuggested = $this->reportProgressService->hasCompletedSuggestedPractice($user);
        $requirePractice = $user->require_suggested_practice_before_compete ?? false;
        $canPlay = $hasCompletedSuggested || ! $requirePractice;

        return Inertia::render('Compete/Index', [
            'game' => config('game'),
            'suggestedPractice' => $suggestedPractice,
            'requireSuggestedPractice' => $requirePractice,
            'canPlay' => $canPlay,
        ]);
    }

    public function create(Request $request)
    {
        $user = $request->user();

        if ($user->require_suggested_practice_before_compete && ! $this->reportProgressService->hasCompletedSuggestedPractice($user)) {
            return redirect()->route('compete.index')->with('error', __('report_card.complete_practice_first'));
        }
        $difficulty = Grade::tryFromGradeOrDifficulty($request->get('grade') ?? $request->get('difficulty', 'grade_4'))
            ?? Difficulty::Easy;

        $grade = $request->get('grade', 'grade_4');
        if (!in_array($grade, ['grade_3', 'grade_4', 'grade_5', 'grade_6'], true)) {
            $grade = 'grade_4';
        }

        $mode = $request->get('mode', 'regular');
        if (!in_array($mode, ['regular', 'countdown'], true)) {
            $mode = 'regular';
        }
        $timeLimit = $mode === 'countdown'
            ? max(5, min(120, (int) ($request->get('time_limit_seconds') ?? 25)))
            : null;

        $game = CompetitiveGame::create([
            'code' => CompetitiveGame::generateCode(),
            'status' => 'waiting',
            'mode' => $mode,
            'time_limit_seconds' => $timeLimit,
            'difficulty' => $difficulty,
        ]);

        $game->players()->create([
            'user_id' => $user->id,
            'grade' => $grade,
        ]);

        broadcast(new CompetitionInvite($user->name, $user->id, $game->code));

        return redirect()->route('compete.show', $game->code);
    }

    public function show(Request $request, string $code)
    {
        $game = CompetitiveGame::where('code', strtoupper($code))->firstOrFail();
        $user = $request->user();

        if (!$game->hasPlayer($user)) {
            $grade = $request->get('grade', 'grade_4');
            if (!in_array($grade, ['grade_3', 'grade_4', 'grade_5', 'grade_6'], true)) {
                $grade = 'grade_4';
            }
            $game->players()->create(['user_id' => $user->id, 'grade' => $grade]);

            if ($game->players()->count() === 2 && $game->isWaiting()) {
                $this->startGame($game);
            }
        }

        $myProblem = $this->getProblemForUser($game, $user->id);

        return Inertia::render('Compete/Show', [
            'game' => $this->formatGame($game),
            'problem' => $myProblem ? $this->formatProblem($myProblem) : null,
            'results' => $game->isFinished() ? $this->buildResults($game) : [],
            'me' => [
                'id' => $user->id,
                'name' => $user->name,
            ],
        ]);
    }

    public function join(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:4',
            'grade' => 'nullable|in:grade_3,grade_4,grade_5,grade_6',
        ]);

        $game = CompetitiveGame::where('code', strtoupper($request->code))->first();

        if (!$game) {
            return back()->withErrors(['code' => 'Invalid game code.']);
        }

        if ($game->isFinished()) {
            return back()->withErrors(['code' => 'This game has ended.']);
        }

        $user = $request->user();
        if ($game->hasPlayer($user)) {
            return redirect()->route('compete.show', $game->code);
        }

        if ($game->players()->count() >= 2) {
            return back()->withErrors(['code' => 'This game is full.']);
        }

        $grade = $request->get('grade', 'grade_4');
        $game->players()->create(['user_id' => $user->id, 'grade' => $grade]);

        if ($game->players()->count() === 2 && $game->isWaiting()) {
            $this->startGame($game);
        }

        return redirect()->route('compete.show', $game->code);
    }

    public function timeout(Request $request)
    {
        $request->validate([
            'game_code' => 'required|string|size:4',
            'problem_id' => 'required|exists:problems,id',
        ]);

        $game = CompetitiveGame::where('code', strtoupper($request->game_code))->firstOrFail();
        $user = $request->user();

        if (!$game->isActive() || $game->mode !== 'countdown') {
            return response()->json(['error' => 'Invalid request'], 422);
        }

        if (!$game->hasPlayer($user)) {
            return response()->json(['error' => 'Not a player'], 403);
        }

        $problem = Problem::findOrFail($request->problem_id);
        $myRound = $game->rounds()
            ->where('round_number', $game->current_round)
            ->where('user_id', $user->id)
            ->first();
        if (!$myRound || $myRound->problem_id !== $problem->id) {
            return response()->json(['error' => 'Wrong problem'], 422);
        }

        $existing = CompetitiveGameAnswer::where('competitive_game_id', $game->id)
            ->where('user_id', $user->id)
            ->where('problem_id', $problem->id)
            ->exists();

        if ($existing) {
            return response()->json(['error' => 'Already answered'], 422);
        }

        $timeSpent = $game->time_limit_seconds ?? 25;

        CompetitiveGameAnswer::create([
            'competitive_game_id' => $game->id,
            'user_id' => $user->id,
            'problem_id' => $problem->id,
            'answer' => '',
            'correct' => false,
            'time_spent_seconds' => $timeSpent,
        ]);

        $scores = $game->players()
            ->with('user:id,name')
            ->get()
            ->map(fn ($p) => [
                'user_id' => $p->user_id,
                'name' => $p->user->name,
                'score' => $p->score,
            ])
            ->toArray();

        broadcast(new PlayerAnswered($game, $scores, $user->id, false))->toOthers();

        $roundProblemIds = $game->rounds()
            ->where('round_number', $game->current_round)
            ->pluck('problem_id');
        $uniqueResponders = $game->answers()
            ->whereIn('problem_id', $roundProblemIds)
            ->pluck('user_id')
            ->unique();
        $bothAnswered = $uniqueResponders->count() >= 2;

        $payload = [
            'correct' => false,
            'points_earned' => 0,
            'speed_bonus' => 0,
            'first_bonus' => 0,
            'scores' => $scores,
            'timed_out' => true,
        ];

        if ($bothAnswered) {
            $this->advanceRound($game);
            $game->refresh();
            if ($game->isFinished()) {
                $payload['game_ended'] = true;
                $payload['results'] = $this->buildResults($game);
                $payload['final_scores'] = $game->players()->with('user:id,name')->get()
                    ->map(fn ($p) => ['user_id' => $p->user_id, 'name' => $p->user->name, 'score' => $p->score])
                    ->toArray();
            } else {
                $payload['round_advanced'] = true;
                $payload['current_round'] = $game->current_round;
                $payload['round_ends_at'] = $game->round_ends_at?->toIso8601String();
                $payload['problem'] = $this->formatProblem($this->getProblemForUser($game, $user->id));
            }
        }

        return response()->json($payload);
    }

    public function submit(Request $request)
    {
        $request->validate([
            'game_code' => 'required|string|size:4',
            'problem_id' => 'required|exists:problems,id',
            'answer' => 'required|string',
            'time_spent_seconds' => 'nullable|integer|min:0',
        ]);

        $game = CompetitiveGame::where('code', strtoupper($request->game_code))->firstOrFail();
        $user = $request->user();

        if (!$game->isActive()) {
            return response()->json(['error' => 'Game not active'], 422);
        }

        if (!$game->hasPlayer($user)) {
            return response()->json(['error' => 'Not a player'], 403);
        }

        $problem = Problem::findOrFail($request->problem_id);
        $myRound = $game->rounds()
            ->where('round_number', $game->current_round)
            ->where('user_id', $user->id)
            ->first();
        if (!$myRound || $myRound->problem_id !== $problem->id) {
            return response()->json(['error' => 'Wrong problem'], 422);
        }

        $existing = CompetitiveGameAnswer::where('competitive_game_id', $game->id)
            ->where('user_id', $user->id)
            ->where('problem_id', $problem->id)
            ->exists();

        if ($existing) {
            return response()->json(['error' => 'Already answered'], 422);
        }

        $answer = trim($request->answer);
        $correct = $problem->isCorrect($answer);
        $timeSpent = $request->time_spent_seconds ?? 0;

        CompetitiveGameAnswer::create([
            'competitive_game_id' => $game->id,
            'user_id' => $user->id,
            'problem_id' => $problem->id,
            'answer' => $answer,
            'correct' => $correct,
            'time_spent_seconds' => $timeSpent,
        ]);

        $basePoints = config('game.xp_per_correct', 50);
        $points = 0;
        $speedBonus = 0;
        $firstBonus = 0;

        if ($correct) {
            $points = $basePoints;
            if ($timeSpent <= 5) {
                $speedBonus = 15;
                $points += $speedBonus;
            }
            $roundProblemIds = $game->rounds()
                ->where('round_number', $game->current_round)
                ->pluck('problem_id');
            $firstCorrectInRound = $game->answers()
                ->whereIn('problem_id', $roundProblemIds)
                ->where('correct', true)
                ->orderBy('created_at')
                ->first();
            $firstInRound = !$firstCorrectInRound || $firstCorrectInRound->user_id === $user->id;
            if ($firstInRound) {
                $firstBonus = 15;
                $points += $firstBonus;
            }
        }

        $game->getPlayer($user)->increment('score', $points);

        $scores = $game->players()
            ->with('user:id,name')
            ->get()
            ->map(fn ($p) => [
                'user_id' => $p->user_id,
                'name' => $p->user->name,
                'score' => $p->score,
            ])
            ->toArray();

        broadcast(new PlayerAnswered($game, $scores, $user->id, $correct))->toOthers();

        $roundProblemIds = $game->rounds()
            ->where('round_number', $game->current_round)
            ->pluck('problem_id');
        $uniqueResponders = $game->answers()
            ->whereIn('problem_id', $roundProblemIds)
            ->pluck('user_id')
            ->unique();
        $bothAnswered = $uniqueResponders->count() >= 2;

        $payload = [
            'correct' => $correct,
            'points_earned' => $points,
            'speed_bonus' => $speedBonus,
            'first_bonus' => $firstBonus,
            'scores' => $scores,
        ];

        if ($bothAnswered) {
            $this->advanceRound($game);
            $game->refresh();
            if ($game->isFinished()) {
                $payload['game_ended'] = true;
                $payload['results'] = $this->buildResults($game);
                $payload['final_scores'] = $game->players()->with('user:id,name')->get()
                    ->map(fn ($p) => ['user_id' => $p->user_id, 'name' => $p->user->name, 'score' => $p->score])
                    ->toArray();
            } else {
                $myRound = $game->rounds()
                    ->where('round_number', $game->current_round)
                    ->where('user_id', $user->id)
                    ->with('problem')
                    ->first();
                $payload['round_advanced'] = true;
                $payload['problem'] = $myRound ? $this->formatProblem($myRound->problem) : null;
                $payload['current_round'] = $game->current_round;
                $payload['round_ends_at'] = $game->round_ends_at?->toIso8601String();
            }
        }

        return response()->json($payload);
    }

    private function startGame(CompetitiveGame $game): void
    {
        $game->update(['status' => 'active']);

        $players = $game->players()->with('user')->get();
        $gradeToDifficulty = fn (string $grade) => \App\Enums\Grade::tryFrom($grade)?->toDifficulty() ?? \App\Enums\Difficulty::Easy;

        for ($roundNum = 1; $roundNum <= $game->total_rounds; $roundNum++) {
            foreach ($players as $player) {
                $difficulty = $gradeToDifficulty($player->grade ?? 'grade_4');
                $problem = $this->generator->generateRandom($difficulty);
                $game->rounds()->create([
                    'user_id' => $player->user_id,
                    'problem_id' => $problem->id,
                    'round_number' => $roundNum,
                ]);
            }
        }

        $this->startRound($game);
    }

    private function startRound(CompetitiveGame $game): void
    {
        $roundNum = $game->current_round + 1;
        $rounds = $game->rounds()->where('round_number', $roundNum)->with('problem')->get();

        $seconds = $game->mode === 'countdown' ? ($game->time_limit_seconds ?? 25) : null;
        $endsAt = $seconds ? now()->addSeconds($seconds) : null;
        $game->update([
            'current_round' => $roundNum,
            'current_problem_id' => null,
            'round_ends_at' => $endsAt,
        ]);

        $players = $game->players()->with('user:id,name')->get()
            ->map(fn ($p) => ['user_id' => $p->user_id, 'name' => $p->user->name, 'score' => $p->score])
            ->toArray();

        $problemsByUser = $rounds->mapWithKeys(fn ($r) => [$r->user_id => $this->formatProblem($r->problem)]);

        if ($roundNum === 1) {
            broadcast(new GameStarted($game, $players, $problemsByUser->toArray()))->toOthers();
        } else {
            broadcast(new RoundStarted($game, $problemsByUser->toArray(), $roundNum, $endsAt?->toIso8601String()))->toOthers();
        }
    }

    private function advanceRound(CompetitiveGame $game): void
    {
        if ($game->current_round >= $game->total_rounds) {
            $game->update(['status' => 'finished', 'current_problem_id' => null, 'round_ends_at' => null]);

            $finalScores = $game->players()->with('user:id,name')->get()
                ->map(fn ($p) => ['user_id' => $p->user_id, 'name' => $p->user->name, 'score' => $p->score])
                ->toArray();

            $results = $this->buildResults($game);
            $winner = $game->players()->orderByDesc('score')->first();
            broadcast(new GameEnded($game, $finalScores, $winner?->user_id, $results))->toOthers();
        } else {
            $this->startRound($game);
        }
    }

    private function formatGame(CompetitiveGame $game): array
    {
        $players = $game->players()->with('user:id,name')->get()
            ->map(fn ($p) => [
                'user_id' => $p->user_id,
                'name' => $p->user->name,
                'score' => $p->score,
                'grade' => $p->grade ?? 'grade_4',
            ])
            ->toArray();

        return [
            'code' => $game->code,
            'status' => $game->status,
            'mode' => $game->mode ?? 'regular',
            'time_limit_seconds' => $game->time_limit_seconds,
            'difficulty' => $game->difficulty->value,
            'total_rounds' => $game->total_rounds,
            'current_round' => $game->current_round,
            'players' => $players,
            'round_ends_at' => $game->round_ends_at?->toIso8601String(),
        ];
    }

    private function getProblemForUser(CompetitiveGame $game, int $userId): ?Problem
    {
        if ($game->current_round < 1) {
            return null;
        }
        $round = $game->rounds()
            ->where('round_number', $game->current_round)
            ->where('user_id', $userId)
            ->with('problem')
            ->first();

        return $round?->problem;
    }

    private function buildResults(CompetitiveGame $game): array
    {
        $roundNumbers = $game->rounds()->distinct()->pluck('round_number')->sort()->values();
        $playersOrdered = $game->players()->with('user:id,name')->orderBy('id')->get();

        $results = [];
        foreach ($roundNumbers as $roundNum) {
            $rounds = $game->rounds()->where('round_number', $roundNum)->with('problem')->get();
            $players = [];
            foreach ($playersOrdered as $p) {
                $round = $rounds->firstWhere('user_id', $p->user_id);
                $ans = $round
                    ? $game->answers()->where('problem_id', $round->problem_id)->where('user_id', $p->user_id)->first()
                    : null;
                $points = 0;
                if ($ans && $ans->correct) {
                    $points = config('game.xp_per_correct', 50);
                    if ($ans->time_spent_seconds <= 5) {
                        $points += 15;
                    }
                    $roundProblemIds = $rounds->pluck('problem_id');
                    $firstCorrect = $game->answers()
                        ->whereIn('problem_id', $roundProblemIds)
                        ->where('correct', true)
                        ->orderBy('created_at')
                        ->first();
                    if ($firstCorrect && $firstCorrect->user_id === $p->user_id) {
                        $points += 15;
                    }
                }
                $players[] = [
                    'user_id' => $p->user_id,
                    'name' => $p->user->name,
                    'time' => $ans?->time_spent_seconds ?? null,
                    'points' => $points,
                ];
            }
            $results[] = [
                'round' => $roundNum,
                'players' => $players,
            ];
        }

        return $results;
    }


    private function formatProblem(Problem $problem): array
    {
        $base = [
            'id' => $problem->id,
            'type' => $problem->type->value,
            'difficulty' => $problem->difficulty->value,
            'question_text' => $problem->question_text,
        ];

        $metadata = $problem->metadata ?? [];
        if ($problem->type->value !== 'word_problem' && isset($metadata['a'], $metadata['b'])) {
            $base['stacked'] = [
                'top' => (string) $metadata['a'],
                'operator' => $problem->type->symbol(),
                'bottom' => (string) $metadata['b'],
            ];
        }

        return $base;
    }
}
