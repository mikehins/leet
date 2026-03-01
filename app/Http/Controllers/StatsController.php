<?php

namespace App\Http\Controllers;

use App\Enums\ProblemType;
use App\Models\User;
use App\Models\UserProgress;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StatsController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();
        $progress = UserProgress::getOrCreateFor($user);

        $attempts = $user->problemAttempts()->with('problem')->get();
        $correctAttempts = $attempts->where('correct', true);

        $byType = collect(ProblemType::cases())
            ->filter(fn ($t) => $t !== ProblemType::WordProblem)
            ->mapWithKeys(fn ($type) => [
                $type->value => [
                    'total' => $attempts->filter(fn ($a) => $a->problem?->type === $type)->count(),
                    'correct' => $correctAttempts->filter(fn ($a) => $a->problem?->type === $type)->count(),
                ],
            ]);

        $wordProblems = $attempts->filter(fn ($a) => $a->problem?->type === ProblemType::WordProblem);
        $wordCorrect = $wordProblems->where('correct', true)->count();

        $totalTime = $attempts->sum('time_spent_seconds');
        $avgTime = $correctAttempts->count() > 0
            ? (int) round($correctAttempts->avg('time_spent_seconds'))
            : 0;

        $fastAnswers = $correctAttempts->where('time_spent_seconds', '<=', 5)->count();

        return Inertia::render('Stats/Index', [
            'game' => config('game'),
            'progress' => [
                'level' => $progress->level,
                'total_points' => $progress->total_points,
                'current_streak' => $progress->current_streak,
                'longest_streak' => $progress->longest_streak,
                'chat_questions_count' => $progress->chat_questions_count ?? 0,
            ],
            'stats' => [
                'total_attempts' => $attempts->count(),
                'correct_attempts' => $correctAttempts->count(),
                'accuracy' => $attempts->count() > 0
                    ? (int) round(100 * $correctAttempts->count() / $attempts->count())
                    : 0,
                'total_time_seconds' => $totalTime,
                'avg_time_seconds' => $avgTime,
                'fast_answers' => $fastAnswers,
                'badges_earned' => $user->badges()->count(),
                'badges_total' => \App\Models\Badge::count(),
            ],
            'byType' => $byType,
            'wordProblems' => [
                'total' => $wordProblems->count(),
                'correct' => $wordCorrect,
            ],
            'viewingUser' => null,
        ]);
    }

    public function show(Request $request, User $user)
    {
        $me = $request->user();
        if ($user->id === $me->id) {
            return redirect()->route('stats.index');
        }

        $friendIds = $me->friendsList()->pluck('id')->all();
        if (!in_array($user->id, $friendIds, true)) {
            abort(403, 'You can only view stats of your friends.');
        }

        $progress = UserProgress::getOrCreateFor($user);
        $attempts = $user->problemAttempts()->with('problem')->get();
        $correctAttempts = $attempts->where('correct', true);

        $byType = collect(ProblemType::cases())
            ->filter(fn ($t) => $t !== ProblemType::WordProblem)
            ->mapWithKeys(fn ($type) => [
                $type->value => [
                    'total' => $attempts->filter(fn ($a) => $a->problem?->type === $type)->count(),
                    'correct' => $correctAttempts->filter(fn ($a) => $a->problem?->type === $type)->count(),
                ],
            ]);

        $wordProblems = $attempts->filter(fn ($a) => $a->problem?->type === ProblemType::WordProblem);
        $wordCorrect = $wordProblems->where('correct', true)->count();

        $totalTime = $attempts->sum('time_spent_seconds');
        $avgTime = $correctAttempts->count() > 0
            ? (int) round($correctAttempts->avg('time_spent_seconds'))
            : 0;

        $fastAnswers = $correctAttempts->where('time_spent_seconds', '<=', 5)->count();

        return Inertia::render('Stats/Index', [
            'game' => config('game'),
            'viewingUser' => [
                'id' => $user->id,
                'name' => $user->name,
                'avatar_url' => $user->avatar_url,
            ],
            'progress' => [
                'level' => $progress->level,
                'total_points' => $progress->total_points,
                'current_streak' => $progress->current_streak,
                'longest_streak' => $progress->longest_streak,
                'chat_questions_count' => $progress->chat_questions_count ?? 0,
            ],
            'stats' => [
                'total_attempts' => $attempts->count(),
                'correct_attempts' => $correctAttempts->count(),
                'accuracy' => $attempts->count() > 0
                    ? (int) round(100 * $correctAttempts->count() / $attempts->count())
                    : 0,
                'total_time_seconds' => $totalTime,
                'avg_time_seconds' => $avgTime,
                'fast_answers' => $fastAnswers,
                'badges_earned' => $user->badges()->count(),
                'badges_total' => \App\Models\Badge::count(),
            ],
            'byType' => $byType,
            'wordProblems' => [
                'total' => $wordProblems->count(),
                'correct' => $wordCorrect,
            ],
        ]);
    }
}
