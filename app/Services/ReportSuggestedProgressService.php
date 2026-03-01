<?php

namespace App\Services;

use App\Enums\ProblemType;
use App\Models\Badge;
use App\Models\Problem;
use App\Models\ReportSuggestedProgress;
use App\Models\User;
use Illuminate\Support\Collection;

class ReportSuggestedProgressService
{
    /**
     * Record a correct answer and update suggested progress. Returns newly awarded badges.
     *
     * @return Collection<int, Badge>
     */
    public function recordCorrect(User $user, Problem $problem): Collection
    {
        $type = $problem->type;
        if ($type === ProblemType::WordProblem) {
            return collect();
        }

        $topic = $type->value;

        $progressRecords = ReportSuggestedProgress::where('user_id', $user->id)
            ->where('topic', $topic)
            ->whereColumn('correct_count', '<', 'target_count')
            ->get();

        $newlyAwarded = collect();

        foreach ($progressRecords as $record) {
            $record->increment('correct_count');

            if ($record->correct_count >= $record->target_count) {
                $record->update(['completed_at' => now()]);

                $report = $record->report;
                if ($report && $report->isFullyCompleted()) {
                    $badge = Badge::where('slug', 'report_card_star')->first();
                    if ($badge && ! $badge->hasUser($user)) {
                        $user->badges()->attach($badge->id, ['earned_at' => now()]);
                        $newlyAwarded->push($badge);
                    }
                }
            }
        }

        return $newlyAwarded;
    }

    /**
     * Get active suggested practice for user (from latest report).
     */
    public function getActiveSuggestedPractice(User $user): ?array
    {
        $latestReport = $user->aiStudentReports()
            ->whereHas('suggestedProgress', fn ($q) => $q->whereColumn('correct_count', '<', 'target_count'))
            ->orderByDesc('period_end')
            ->first();

        if (! $latestReport) {
            return null;
        }

        $progress = $latestReport->suggestedProgress()
            ->whereColumn('correct_count', '<', 'target_count')
            ->get();

        if ($progress->isEmpty()) {
            return null;
        }

        return [
            'report_id' => $latestReport->id,
            'period_end' => $latestReport->period_end->format('Y-m-d'),
            'items' => $progress->map(fn ($p) => [
                'topic' => $p->topic,
                'correct_count' => $p->correct_count,
                'target_count' => $p->target_count,
            ]),
        ];
    }

    public function hasCompletedSuggestedPractice(User $user): bool
    {
        $active = $this->getActiveSuggestedPractice($user);

        return $active === null;
    }
}
