<?php

namespace App\Http\Controllers;

use App\Mail\RewardRequestNotification;
use App\Models\RewardRequest;
use App\Models\UserProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class RewardRequestController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $progress = UserProgress::getOrCreateFor($user);
        $totalPoints = $progress->total_points;
        $dollarsValue = RewardRequest::pointsToDollars($totalPoints);

        $tiers = collect(config('game.reward_tiers_dollars', []))
            ->map(fn ($points, $dollars) => [
                'dollars' => (int) $dollars,
                'points' => $points,
                'label' => '$' . $dollars,
            ])
            ->values()
            ->all();

        $recentRequests = $user->rewardRequests()
            ->latest()
            ->take(5)
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'points_spent' => $r->points_spent,
                'dollars_value' => $r->dollars_value,
                'status' => $r->status,
                'reward_tier' => $r->reward_tier,
                'created_at' => $r->created_at->diffForHumans(),
            ]);

        return Inertia::render('Rewards/Index', [
            'totalPoints' => $totalPoints,
            'dollarsValue' => $dollarsValue,
            'tiers' => $tiers,
            'recentRequests' => $recentRequests,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'points_spent' => 'required|integer|min:100',
            'message' => 'nullable|string|max:500',
        ]);

        $user = $request->user();
        $progress = UserProgress::getOrCreateFor($user);
        $pointsSpent = (int) $request->points_spent;

        $tiers = config('game.reward_tiers_dollars', []);
        $validPoints = array_values($tiers);
        if (! in_array($pointsSpent, $validPoints, true)) {
            return back()->withErrors(['points_spent' => __('rewards.invalid_tier')]);
        }

        if ($progress->total_points < $pointsSpent) {
            return back()->withErrors(['points_spent' => __('rewards.insufficient_points')]);
        }

        $dollarsValue = RewardRequest::pointsToDollars($pointsSpent);
        $rewardTier = array_search($pointsSpent, $tiers);

        $rewardRequest = RewardRequest::create([
            'user_id' => $user->id,
            'points_spent' => $pointsSpent,
            'dollars_value' => $dollarsValue,
            'status' => 'pending',
            'message' => $request->message,
            'reward_tier' => '$' . $rewardTier,
        ]);

        $progress->total_points -= $pointsSpent;
        $progress->save();

        $parentEmail = $user->parentEmail();
        if ($parentEmail) {
            Mail::to($parentEmail)->send(new RewardRequestNotification($rewardRequest));
            $rewardRequest->update(['parent_notified_at' => now()]);
        }

        return redirect()->route('rewards.index')->with('success', __('rewards.request_sent'));
    }
}
