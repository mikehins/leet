<?php

namespace App\Http\Middleware;

use App\Models\UserProgress;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AwardLoginBonus
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $user = $request->user();
        if (! $user) {
            return $response;
        }

        $progress = UserProgress::getOrCreateFor($user);
        $today = now()->toDateString();
        $lastLogin = $progress->last_login_date?->toDateString();

        if ($lastLogin === $today) {
            return $response;
        }

        $bonusXp = config('game.login_bonus_xp', 10);
        $streakBonusXp = config('game.login_streak_bonus_xp', 25);
        $streakDays = config('game.login_streak_days', 7);

        $yesterday = now()->subDay()->toDateString();
        if ($lastLogin === $yesterday) {
            $progress->login_streak = ($progress->login_streak ?? 0) + 1;
            if ($progress->login_streak >= $streakDays) {
                $bonusXp = $streakBonusXp;
            }
        } else {
            $progress->login_streak = 1;
        }

        $progress->last_login_date = $today;
        $progress->total_points = ($progress->total_points ?? 0) + $bonusXp;
        $progress->save();

        return $response;
    }
}
