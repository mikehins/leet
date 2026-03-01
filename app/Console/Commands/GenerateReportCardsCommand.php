<?php

namespace App\Console\Commands;

use App\Jobs\GenerateReportCardsJob;
use Carbon\Carbon;
use Illuminate\Console\Command;

class GenerateReportCardsCommand extends Command
{
    protected $signature = 'report-cards:generate
        {--days=14 : Number of days for the report period}
        {--user= : Generate for a specific user ID only}';

    protected $description = 'Generate AI report cards for users with enough activity';

    public function handle(): int
    {
        $days = (int) $this->option('days');
        $end = Carbon::today();
        $start = $end->copy()->subDays($days);

        $this->info("Generating report cards for period {$start->toDateString()} to {$end->toDateString()}");

        if ($this->option('user')) {
            $userId = (int) $this->option('user');
            $this->info("User ID filter: {$userId}");
        }

        GenerateReportCardsJob::dispatch($start, $end);

        $this->info('Report cards job dispatched. Run queue workers to process.');

        return self::SUCCESS;
    }
}
