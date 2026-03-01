<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\ReportGeneratorService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportCardController extends Controller
{
    public function __construct(
        private readonly ReportGeneratorService $reportService
    ) {}

    /**
     * Show report card for the given user. Parents can view their children's reports.
     */
    public function show(Request $request, ?User $user = null)
    {
        $actingUser = $request->user();
        $targetUser = $user ?? $actingUser;

        if ($targetUser->id !== $actingUser->id) {
            if (! $actingUser->isParent() || ! $actingUser->children()->where('id', $targetUser->id)->exists()) {
                abort(403, 'You can only view report cards for your children.');
            }
        }

        if ($actingUser->isParent() && $actingUser->children()->count() > 0 && ! $user) {
            $targetUser = $actingUser->children()->orderBy('name')->first();
        }

        $reports = $targetUser->aiStudentReports()
            ->with('suggestedProgress')
            ->orderByDesc('period_end')
            ->get();

        $percentiles = $this->reportService->computePercentiles($targetUser);
        $chartData = $this->reportService->getChartData($targetUser);

        $isParentViewing = $actingUser->isParent() && $targetUser->parent_id === $actingUser->id;

        return Inertia::render('ReportCard/Show', [
            'game' => config('game'),
            'targetUser' => [
                'id' => $targetUser->id,
                'name' => $targetUser->name,
                'avatar_url' => $targetUser->avatar_url,
                'require_suggested_practice_before_compete' => $targetUser->require_suggested_practice_before_compete,
            ],
            'isParentViewing' => $isParentViewing,
            'reports' => $reports->map(fn ($r) => [
                'id' => $r->id,
                'period_start' => $r->period_start->format('Y-m-d'),
                'period_end' => $r->period_end->format('Y-m-d'),
                'summary' => $r->summary,
                'suggested_topics' => $r->suggested_topics ?? [],
                'strengths' => $r->strengths ?? [],
                'recommendations' => $r->recommendations ?? [],
                'ai_insights' => $r->ai_insights ?? [],
                'areas_to_improve' => $r->areas_to_improve ?? [],
                'suggested_progress' => $r->suggestedProgress->map(fn ($p) => [
                    'topic' => $p->topic,
                    'correct_count' => $p->correct_count,
                    'target_count' => $p->target_count,
                    'completed_at' => $p->completed_at?->toIso8601String(),
                ]),
                'is_fully_completed' => $r->isFullyCompleted(),
            ]),
            'percentiles' => $percentiles,
            'chartData' => $chartData,
            'children' => $actingUser->isParent() ? $actingUser->children()->orderBy('name')->get()->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'avatar_url' => $c->avatar_url,
            ]) : [],
        ]);
    }

    public function updateSetting(Request $request)
    {
        $user = $request->user();

        $childId = $request->input('child_id');
        if ($childId && $user->children()->where('id', $childId)->exists()) {
            $user->children()->findOrFail($childId)->update([
                'require_suggested_practice_before_compete' => $request->boolean('require_suggested_practice_before_compete'),
            ]);
        } else {
            $user->update([
                'require_suggested_practice_before_compete' => $request->boolean('require_suggested_practice_before_compete'),
            ]);
        }

        return back()->with('success', __('report_card.setting_updated'));
    }

    public function ask(Request $request)
    {
        $request->validate(['question' => 'required|string|max:500', 'user_id' => 'nullable|exists:users,id']);

        $actingUser = $request->user();
        $targetUser = $request->user_id
            ? $actingUser->children()->findOrFail($request->user_id)
            : $actingUser;

        if ($targetUser->id !== $actingUser->id && ! $actingUser->children()->where('id', $targetUser->id)->exists()) {
            abort(403);
        }

        $answer = $this->reportService->answerQuestion($targetUser, $request->question);

        return response()->json(['answer' => $answer]);
    }
}
