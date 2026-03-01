<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\ReportGeneratorService;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateReportCardsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private readonly Carbon $periodStart,
        private readonly Carbon $periodEnd
    ) {}

    public function handle(ReportGeneratorService $service): void
    {
        $userIds = User::whereHas('problemAttempts')->pluck('id');

        foreach ($userIds as $userId) {
            $user = User::find($userId);
            if (! $user) {
                continue;
            }

            $existing = $user->aiStudentReports()
                ->where('period_end', $this->periodEnd)
                ->exists();

            if ($existing) {
                continue;
            }

            $service->generateForUser($user, $this->periodStart, $this->periodEnd);
        }
    }
}
