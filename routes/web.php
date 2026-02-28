<?php

use App\Http\Controllers\BadgesController;
use App\Http\Controllers\CompetitiveGameController;
use App\Http\Controllers\StatsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PlayController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

Route::post('/locale/{locale}', function (string $locale) {
    if (in_array($locale, ['en', 'fr'], true)) {
        Session::put('locale', $locale);
    }
    return redirect()->back();
})->name('locale.switch');

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'game' => config('game'),
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
    Route::get('/play', [PlayController::class, 'random'])->name('play');
    Route::get('/play/addition', [PlayController::class, 'index'])->name('play.addition');
    Route::get('/play/subtraction', [PlayController::class, 'index'])->name('play.subtraction');
    Route::get('/play/multiplication', [PlayController::class, 'index'])->name('play.multiplication');
    Route::get('/play/division', [PlayController::class, 'index'])->name('play.division');
    Route::post('/play/submit', [PlayController::class, 'submit'])->name('play.submit');
    Route::post('/play/hint', [PlayController::class, 'hint'])->name('play.hint');
    Route::post('/play/explain', [PlayController::class, 'explain'])->name('play.explain');

    Route::get('/think', [\App\Http\Controllers\ThinkController::class, 'index'])->name('think.index');
    Route::post('/think/generate', [\App\Http\Controllers\ThinkController::class, 'generate'])->name('think.generate');
    Route::get('/think/result/{token}', [\App\Http\Controllers\ThinkController::class, 'result'])->name('think.result');
    Route::post('/think/ask', [\App\Http\Controllers\ThinkController::class, 'ask'])->name('think.ask');
    Route::post('/think/speak', [\App\Http\Controllers\ThinkController::class, 'speak'])->name('think.speak');
    Route::post('/think/submit', [\App\Http\Controllers\ThinkController::class, 'submit'])->name('think.submit');

    Route::get('/badges', BadgesController::class)->name('badges.index');
    Route::get('/stats', StatsController::class)->name('stats.index');
    Route::get('/compete', fn () => Inertia::render('Compete/Index', ['game' => config('game')]))->name('compete.index');
    Route::post('/compete', [CompetitiveGameController::class, 'create'])->name('compete.create');
    Route::get('/compete/join', fn () => Inertia::render('Compete/Join', [
        'game' => config('game'),
        'code' => request()->query('code', ''),
    ]))->name('compete.join');
    Route::post('/compete/join', [CompetitiveGameController::class, 'join'])->name('compete.join.submit');
    Route::get('/compete/{code}', [CompetitiveGameController::class, 'show'])->name('compete.show');
    Route::post('/compete/submit', [CompetitiveGameController::class, 'submit'])->name('compete.submit');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
