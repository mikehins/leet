<?php

use App\Jobs\GenerateReportCardsJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Bi-weekly report cards: 1st and 15th of each month at 8pm
$reportCardCallback = function () {
    $end = Carbon::today();
    $start = $end->copy()->subDays(14);
    GenerateReportCardsJob::dispatch($start, $end);
};
Schedule::call($reportCardCallback)->monthlyOn(1, '20:00');
Schedule::call($reportCardCallback)->monthlyOn(15, '20:00');
