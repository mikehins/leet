<?php

namespace App\Http\Controllers;

use App\Enums\Grade;
use App\Jobs\GenerateWordProblemJob;
use App\Models\Problem;
use App\Models\UserProgress;
use App\Services\BadgeService;
use App\Services\TextToSpeechService;
use App\Services\TutorService;
use Illuminate\Http\Request;
use Laravel\Ai\Exceptions\RateLimitedException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ThinkController extends Controller
{
    public function __construct(
        private TutorService $tutor,
        private TextToSpeechService $tts,
        private BadgeService $badgeService
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();
        $progress = UserProgress::getOrCreateFor($user);

        return Inertia::render('Think/Index', [
            'game' => config('game'),
            'progress' => $this->formatProgress($progress),
        ]);
    }

    public function generate(Request $request)
    {
        $request->validate([
            'grade' => 'nullable|in:grade_3,grade_4,grade_5,grade_6',
            'difficulty' => 'nullable|in:easy,medium,hard',
            'locale' => 'nullable|in:en,fr',
        ]);

        $grade = $request->get('grade', 'grade_4');
        $locale = $request->get('locale') ?? app()->getLocale();
        $token = Str::random(32);

        Cache::put("think_problem:{$token}", ['status' => 'pending'], now()->addMinutes(10));

        GenerateWordProblemJob::dispatch($token, $grade, $locale, $request->user()?->id);

        return response()->json(['token' => $token]);
    }

    public function result(Request $request, string $token)
    {
        $data = Cache::get("think_problem:{$token}");

        if (! $data) {
            return response()->json(['error' => 'expired'], 404);
        }

        if ($data['status'] === 'pending') {
            return response()->json(['status' => 'pending']);
        }

        return response()->json([
            'status' => 'ready',
            'problem' => $data['problem'],
        ]);
    }


    public function ask(Request $request)
    {
        $request->validate([
            'problem_id' => 'required|exists:problems,id',
            'messages' => 'required|array',
            'messages.*.role' => 'required|in:user,assistant',
            'messages.*.content' => 'required|string',
        ]);

        $problem = Problem::findOrFail($request->problem_id);
        $messages = $request->messages;

        try {
            $response = $this->tutor->chat($problem, $messages, app()->getLocale());
        } catch (RateLimitedException $e) {
            return response()->json([
                'message' => __('think.chat_rate_limit'),
            ], 429);
        }

        $user = $request->user();
        $hasAssistantMessage = collect($messages)->contains('role', 'assistant');
        $xpPerChat = config('game.xp_per_chat_response', 5);
        $progress = UserProgress::getOrCreateFor($user);

        if ($hasAssistantMessage && $xpPerChat > 0) {
            $progress->total_points += $xpPerChat;
            $progress->last_activity_date = now()->toDateString();
        }
        $progress->chat_questions_count = ($progress->chat_questions_count ?? 0) + 1;
        $progress->last_activity_date = $progress->last_activity_date ?? now()->toDateString();
        $progress->save();

        $newBadges = $this->badgeService->checkAndAward($user, 'think_ask', []);

        return response()->json([
            'reply' => $response,
            'xp_earned' => $hasAssistantMessage ? $xpPerChat : 0,
            'new_badges' => $newBadges->map(fn ($b) => ['slug' => $b->slug, 'name_key' => $b->name_key, 'icon' => $b->icon])->toArray(),
        ]);
    }

    public function speak(Request $request)
    {
        $request->validate([
            'text' => 'required|string|max:5000',
            'locale' => 'nullable|in:en,fr',
        ]);

        $locale = $request->get('locale') ?? app()->getLocale();
        $result = $this->tts->speak($request->text, $locale);

        return response()->json([
            'audio' => $result['audio'],
            'mime_type' => $result['mime_type'],
        ]);
    }

    public function submit(Request $request)
    {
        $request->validate([
            'problem_id' => 'required|exists:problems,id',
            'answer' => 'required|string',
        ]);

        $problem = Problem::findOrFail($request->problem_id);
        $user = $request->user();
        $answer = trim($request->answer);
        $correct = $problem->isCorrect($answer);

        $user->problemAttempts()->create([
            'problem_id' => $problem->id,
            'answer' => $answer,
            'correct' => $correct,
            'time_spent_seconds' => 0,
        ]);

        $progress = UserProgress::getOrCreateFor($user);
        if ($correct) {
            $progress->total_points += config('game.xp_per_correct', 50);
            $today = now()->toDateString();
            $yesterday = now()->subDay()->toDateString();
            $lastDate = $progress->last_activity_date?->toDateString();
            if (! $lastDate || $lastDate === $yesterday) {
                $progress->current_streak = ($progress->current_streak ?? 0) + 1;
            } elseif ($lastDate !== $today) {
                $progress->current_streak = 1;
            }
            $progress->last_activity_date = $today;
            $progress->longest_streak = max($progress->longest_streak ?? 0, $progress->current_streak);
        }
        $progress->save();

        $newBadges = $this->badgeService->checkAndAward($user, 'think_submit', ['correct' => $correct]);

        return response()->json([
            'correct' => $correct,
            'correct_answer' => $problem->correct_answer,
            'points_earned' => $correct ? config('game.xp_per_correct', 50) : 0,
            'new_total_points' => $progress->total_points,
            'new_badges' => $newBadges->map(fn ($b) => ['slug' => $b->slug, 'name_key' => $b->name_key, 'icon' => $b->icon])->toArray(),
        ]);
    }

    private function formatProgress(UserProgress $progress): array
    {
        return [
            'level' => $progress->level,
            'total_points' => $progress->total_points,
            'xp' => $progress->total_points,
            'current_streak' => $progress->current_streak,
        ];
    }

    private function formatProblem(Problem $problem): array
    {
        return [
            'id' => $problem->id,
            'type' => $problem->type->value,
            'difficulty' => $problem->difficulty->value,
            'question_text' => $problem->question_text,
        ];
    }
}
