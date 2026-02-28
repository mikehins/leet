<?php

namespace App\Http\Controllers;

use App\Models\Badge;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BadgesController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();
        $earnedBadgeIds = $user->badges()->pluck('badges.id')->toArray();

        $badges = Badge::orderBy('sort_order')->get()->map(function (Badge $badge) use ($earnedBadgeIds) {
            $earned = in_array($badge->id, $earnedBadgeIds);

            return [
                'id' => $badge->id,
                'slug' => $badge->slug,
                'name_key' => $badge->name_key,
                'description_key' => $badge->description_key,
                'icon' => $badge->icon,
                'earned' => $earned,
            ];
        });

        return Inertia::render('Badges/Index', [
            'game' => config('game'),
            'badges' => $badges,
            'earned_count' => count($earnedBadgeIds),
            'total_count' => $badges->count(),
        ]);
    }
}
