<?php

namespace App\Http\Controllers;

use App\Enums\Difficulty;
use App\Enums\Grade;
use App\Enums\ProblemType;
use App\Models\Problem;
use Laravel\Ai\Exceptions\RateLimitedException;
use App\Models\UserProgress;
use App\Services\BadgeService;
use App\Services\ProblemGenerator;
use App\Services\TutorService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlayController extends Controller
{
    public function __construct(
        private ProblemGenerator $generator,
        private TutorService $tutor,
        private BadgeService $badgeService
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();
        $progress = UserProgress::getOrCreateFor($user);

        $routeName = $request->route()?->getName();
        $type = match ($routeName) {
            'play.addition' => ProblemType::Addition,
            'play.subtraction' => ProblemType::Subtraction,
            'play.multiplication' => ProblemType::Multiplication,
            'play.division' => ProblemType::Division,
            default => ProblemType::Addition,
        };
        $difficulty = Grade::tryFromGradeOrDifficulty($request->get('grade') ?? $request->get('difficulty'))
            ?? Difficulty::Easy;

        $problem = $this->generator->generate($type, $difficulty);

        $grade = $request->get('grade', 'grade_4');

        return Inertia::render('Play/Index', [
            'game' => config('game'),
            'problem' => $this->formatProblemForFrontend($problem),
            'progress' => $this->formatProgress($progress),
            'grade' => $grade,
        ]);
    }

    public function random(Request $request)
    {
        $user = $request->user();
        $progress = UserProgress::getOrCreateFor($user);

        $difficulty = Grade::tryFromGradeOrDifficulty($request->get('grade') ?? $request->get('difficulty'))
            ?? Difficulty::Easy;
        $problem = $this->generator->generateRandom($difficulty);

        $grade = $request->get('grade', 'grade_4');

        return Inertia::render('Play/Index', [
            'game' => config('game'),
            'problem' => $this->formatProblemForFrontend($problem),
            'progress' => $this->formatProgress($progress),
            'grade' => $grade,
        ]);
    }

    private function formatProgress(UserProgress $progress): array
    {
        return [
            'level' => $progress->level,
            'total_points' => $progress->total_points,
            'xp' => $progress->total_points,
            'current_streak' => $progress->current_streak,
            'longest_streak' => $progress->longest_streak,
        ];
    }

    private function formatProblemForFrontend(Problem $problem): array
    {
        $base = [
            'id' => $problem->id,
            'type' => $problem->type->value,
            'difficulty' => $problem->difficulty->value,
            'question_text' => $problem->question_text,
        ];

        $metadata = $problem->metadata ?? [];
        if ($problem->type !== ProblemType::WordProblem && isset($metadata['a'], $metadata['b'])) {
            $base['stacked'] = [
                'top' => (string) $metadata['a'],
                'operator' => $problem->type->symbol(),
                'bottom' => (string) $metadata['b'],
            ];
        }

        return $base;
    }

    public function submit(Request $request)
    {
        $request->validate([
            'problem_id' => 'required|exists:problems,id',
            'answer' => 'required|string',
            'time_spent_seconds' => 'nullable|integer|min:0',
        ]);

        $problem = Problem::findOrFail($request->problem_id);
        $user = $request->user();
        $answer = trim($request->answer);
        $correct = $problem->isCorrect($answer);

        $attempt = $user->problemAttempts()->create([
            'problem_id' => $problem->id,
            'answer' => $answer,
            'correct' => $correct,
            'time_spent_seconds' => $request->time_spent_seconds,
        ]);

        $progress = UserProgress::getOrCreateFor($user);
        $today = now()->toDateString();

        $baseXp = config('game.xp_per_correct', 50);
        $speedBonus = 0;
        $comboBonus = 0;
        $comboCount = 0;

        if ($correct) {
            $timeSpent = (int) ($request->time_spent_seconds ?? 0);
            $speedConfig = config('game.xp_speed_bonus', []);
            if ($timeSpent <= 5 && isset($speedConfig['under_5_sec'])) {
                $speedBonus = $speedConfig['under_5_sec'];
            } elseif ($timeSpent <= 10 && isset($speedConfig['under_10_sec'])) {
                $speedBonus = $speedConfig['under_10_sec'];
            }

            $consecutiveCorrect = $user->problemAttempts()
                ->orderByDesc('created_at')
                ->limit(10)
                ->get()
                ->takeWhile(fn ($a) => $a->correct)
                ->count();
            $comboCount = min($consecutiveCorrect, 5);
            $comboConfig = config('game.xp_combo_bonus', []);
            $comboBonus = $comboConfig[$comboCount] ?? 0;

            $xpPerCorrect = $baseXp + $speedBonus + $comboBonus;
            $progress->total_points += $xpPerCorrect;

            if ($progress->last_activity_date) {
                $yesterday = now()->subDay()->toDateString();
                if ($progress->last_activity_date->toDateString() === $yesterday) {
                    $progress->current_streak += 1;
                } elseif ($progress->last_activity_date->toDateString() !== $today) {
                    $progress->current_streak = 1;
                }
            } else {
                $progress->current_streak = 1;
            }
            $progress->longest_streak = max($progress->longest_streak, $progress->current_streak);
        } else {
            $progress->current_streak = 0;
        }

        $progress->last_activity_date = $today;
        $progress->save();

        $newBadges = $this->badgeService->checkAndAward($user, 'play_submit', [
            'correct' => $correct,
            'time_spent_seconds' => (int) ($request->time_spent_seconds ?? 0),
            'combo_count' => $comboCount,
        ]);

        return response()->json([
            'correct' => $correct,
            'correct_answer' => $problem->correct_answer,
            'points_earned' => $correct ? $xpPerCorrect : 0,
            'speed_bonus' => $speedBonus,
            'combo_bonus' => $comboBonus,
            'combo_count' => $comboCount,
            'new_total_points' => $progress->total_points,
            'new_streak' => $progress->current_streak,
            'new_badges' => $newBadges->map(fn ($b) => ['slug' => $b->slug, 'name_key' => $b->name_key, 'icon' => $b->icon])->toArray(),
        ]);
    }

    public function hint(Request $request)
    {
        $request->validate([
            'problem_id' => 'required|exists:problems,id',
            'user_answer' => 'required|string',
            'correct_answer' => 'required|string',
        ]);

        $problem = Problem::findOrFail($request->problem_id);
        try {
            $hint = $this->tutor->getHint(
                $problem,
                $request->user_answer,
                $request->correct_answer,
                app()->getLocale(),
            );
        } catch (RateLimitedException $e) {
            return response()->json(['message' => __('play.hint_rate_limit')], 429);
        }

        return response()->json(['hint' => $hint]);
    }

    public function explain(Request $request)
    {
        $request->validate([
            'problem_id' => 'required|exists:problems,id',
            'correct_answer' => 'required|string',
        ]);

        $problem = Problem::findOrFail($request->problem_id);
        try {
            $steps = $this->tutor->explainAnswer($problem, $request->correct_answer, app()->getLocale());
        } catch (RateLimitedException $e) {
            return response()->json(['message' => __('play.explain_rate_limit')], 429);
        }

        return response()->json(['explanation' => $steps->toArray()]);
    }
}
