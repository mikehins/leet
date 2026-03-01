<?php

namespace App\Http\Controllers;

use App\Models\UserProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();
        $progress = UserProgress::getOrCreateFor($user);

        $friendIds = $user->friendsList()->pluck('id')->all();
        $friendActivities = [];
        if (!empty($friendIds)) {
            $friendActivities = DB::table('badge_user')
                ->join('badges', 'badge_user.badge_id', '=', 'badges.id')
                ->join('users', 'badge_user.user_id', '=', 'users.id')
                ->whereIn('badge_user.user_id', $friendIds)
                ->select(
                    'badge_user.earned_at',
                    'badge_user.user_id',
                    'users.name as user_name',
                    'badges.name_key as badge_name_key',
                )
                ->orderByDesc('badge_user.earned_at')
                ->limit(15)
                ->get()
                ->map(fn ($row) => [
                    'type' => 'badge_earned',
                    'user_id' => $row->user_id,
                    'user_name' => $row->user_name,
                    'badge_name_key' => $row->badge_name_key,
                    'earned_at' => \Carbon\Carbon::parse($row->earned_at)->toIso8601String(),
                    'earned_at_human' => \Carbon\Carbon::parse($row->earned_at)->diffForHumans(),
                ])
                ->all();
        }

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

        $xpPerLevel = config('game.xp_per_level', 500);
        $level = max(1, 1 + (int) floor($progress->total_points / $xpPerLevel));
        $today = now()->toDateString();
        $problemsSolvedToday = $user->problemAttempts()
            ->where('correct', true)
            ->whereDate('created_at', $today)
            ->count();
        $questTarget = config('game.daily_quest_problems', 5);
        $questCompletedToday = $progress->daily_quest_completed_at?->toDateString() === $today;

        return Inertia::render('Dashboard', [
            'game' => config('game'),
            'friendActivities' => $friendActivities,
            'progress' => [
                'level' => $level,
                'total_points' => $progress->total_points,
                'current_streak' => $progress->current_streak,
                'longest_streak' => $progress->longest_streak,
                'problems_solved_today' => $problemsSolvedToday,
                'daily_quest_target' => $questTarget,
                'daily_quest_completed' => $questCompletedToday,
            ],
            'stats' => $stats,
            'recentAttempts' => $recentAttempts,
        ]);
    }
}
