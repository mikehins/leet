<?php

namespace App\Console\Commands;

use App\Models\AiCall;
use Illuminate\Console\Command;

class AiStatsCommand extends Command
{
    protected $signature = 'ai:stats
        {--days=30 : Number of days to include}
        {--by-type : Group by call type}';

    protected $description = 'Show AI token usage and call statistics';

    public function handle(): int
    {
        $days = (int) $this->option('days');
        $since = now()->subDays($days);

        $calls = AiCall::where('created_at', '>=', $since)->get();

        if ($calls->isEmpty()) {
            $this->info("No AI calls recorded in the last {$days} days.");

            return self::SUCCESS;
        }

        $this->table(
            ['Metric', 'Value'],
            [
                ['Total calls', $calls->count()],
                ['Prompt tokens', number_format($calls->sum('prompt_tokens'))],
                ['Completion tokens', number_format($calls->sum('completion_tokens'))],
                ['Total tokens', number_format($calls->sum('total_tokens'))],
                ['Unique users', $calls->whereNotNull('user_id')->pluck('user_id')->unique()->count()],
            ]
        );

        if ($this->option('by-type')) {
            $byType = $calls->groupBy('call_type')->map(function ($group, $type) {
                return [
                    $type ?: 'unknown',
                    $group->count(),
                    number_format($group->sum('prompt_tokens')),
                    number_format($group->sum('completion_tokens')),
                    number_format($group->sum('total_tokens')),
                ];
            })->values();

            $this->newLine();
            $this->table(
                ['Call type', 'Calls', 'Prompt tokens', 'Completion tokens', 'Total tokens'],
                $byType->all()
            );
        }

        return self::SUCCESS;
    }
}
