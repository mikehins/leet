<?php

namespace App\Providers;

use App\Listeners\LogAiCall;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Laravel\Ai\Events\AgentPrompted;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Broadcast::routes(['middleware' => ['web', 'auth']]);

        Vite::prefetch(concurrency: 3);

        Event::listen(AgentPrompted::class, LogAiCall::class);
    }
}
