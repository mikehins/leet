<?php

namespace App\Http\Controllers;

use App\Models\UserProgress;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();
        $progress = UserProgress::getOrCreateFor($user);

        $recentAttempts = $user->problemAttempts()
            ->with('problem')
            ->latest()
            ->take(10)
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'question' => $a->problem->question_text,
                'answer' => $a->answer,
                'correct' => $a->correct,
                'created_at' => $a->created_at->diffForHumans(),
            ]);

        $stats = [
            'total_attempts' => $user->problemAttempts()->count(),
            'correct_attempts' => $user->problemAttempts()->where('correct', true)->count(),
            'badges_earned' => $user->badges()->count(),
            'badges_total' => \App\Models\Badge::count(),
        ];
        $stats['accuracy'] = $stats['total_attempts'] > 0
            ? (int) round(100 * $stats['correct_attempts'] / $stats['total_attempts'])
            : 0;

        return Inertia::render('Dashboard', [
            'game' => config('game'),
            'progress' => [
                'level' => $progress->level,
                'total_points' => $progress->total_points,
                'current_streak' => $progress->current_streak,
                'longest_streak' => $progress->longest_streak,
            ],
            'stats' => $stats,
            'recentAttempts' => $recentAttempts,
        ]);
    }
}
