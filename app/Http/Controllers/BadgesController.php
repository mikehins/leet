<?php

namespace App\Http\Controllers;

use App\Models\Badge;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BadgesController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();
        $earnedBadges = $user->badges()->get()->keyBy('id');

        $badges = Badge::orderBy('sort_order')->get()->map(function (Badge $badge) use ($earnedBadges) {
            $pivot = $earnedBadges->get($badge->id)?->pivot;

            return [
                'id' => $badge->id,
                'slug' => $badge->slug,
                'name_key' => $badge->name_key,
                'description_key' => $badge->description_key,
                'icon' => $badge->icon,
                'earned' => (bool) $pivot,
                'earned_at' => $pivot?->earned_at ? Carbon::parse($pivot->earned_at)->toIso8601String() : null,
            ];
        });

        return Inertia::render('Badges/Index', [
            'game' => config('game'),
            'badges' => $badges,
            'earned_count' => $earnedBadges->count(),
            'total_count' => $badges->count(),
        ]);
    }
}
