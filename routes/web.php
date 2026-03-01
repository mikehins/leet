<?php

use App\Http\Controllers\BadgesController;
use App\Http\Controllers\CompetitiveGameController;
use App\Http\Controllers\ReportCardController;
use App\Http\Controllers\FriendController;
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

Route::middleware(['auth', 'verified', \App\Http\Middleware\EnsureProfileSelected::class, \App\Http\Middleware\SetActingUser::class])->group(function () {
    Route::get('/profile-select', [\App\Http\Controllers\ProfileSelectController::class, 'index'])->name('profile-select');
    Route::post('/profile-select', [\App\Http\Controllers\ProfileSelectController::class, 'store'])->name('profile-select.store');

    Route::get('/dashboard', DashboardController::class)->name('dashboard');
    Route::get('/family', [\App\Http\Controllers\FamiliesController::class, 'index'])->name('family.index');
    Route::post('/family', [\App\Http\Controllers\FamiliesController::class, 'store'])->name('family.store');
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
    Route::get('/rewards', [\App\Http\Controllers\RewardRequestController::class, 'index'])->name('rewards.index');
    Route::post('/rewards', [\App\Http\Controllers\RewardRequestController::class, 'store'])->name('rewards.store');
    Route::get('/stats', StatsController::class)->name('stats.index');
    Route::get('/stats/{user}', [StatsController::class, 'show'])->name('stats.show');
    Route::get('/report-card', [ReportCardController::class, 'show'])->name('report-card.index');
    Route::get('/report-card/{user}', [ReportCardController::class, 'show'])->name('report-card.show');
    Route::patch('/report-card/setting', [ReportCardController::class, 'updateSetting'])->name('report-card.update-setting');
    Route::post('/report-card/ask', [ReportCardController::class, 'ask'])->name('report-card.ask');
    Route::get('/friends', [FriendController::class, 'index'])->name('friends.index');
    Route::get('/friends/search', [FriendController::class, 'search'])->name('friends.search');
    Route::post('/friends/send', [FriendController::class, 'send'])->name('friends.send');
    Route::post('/friends/requests/{friendRequest}/accept', [FriendController::class, 'accept'])->name('friends.accept');
    Route::post('/friends/requests/{friendRequest}/reject', [FriendController::class, 'reject'])->name('friends.reject');
    Route::delete('/friends/requests/{friendRequest}', [FriendController::class, 'cancel'])->name('friends.cancel');
    Route::post('/friends/notifications/read', [FriendController::class, 'markNotificationsRead'])->name('friends.notifications.read');
    Route::delete('/friends/notifications', [FriendController::class, 'clearNotifications'])->name('friends.notifications.clear');
    Route::delete('/friends/{user}', [FriendController::class, 'unfriend'])->name('friends.unfriend');
    Route::get('/compete', [CompetitiveGameController::class, 'index'])->name('compete.index');
    Route::post('/compete', [CompetitiveGameController::class, 'create'])->name('compete.create');
    Route::get('/compete/join', fn () => Inertia::render('Compete/Join', [
        'game' => config('game'),
        'code' => request()->query('code', ''),
    ]))->name('compete.join');
    Route::post('/compete/join', [CompetitiveGameController::class, 'join'])->name('compete.join.submit');
    Route::get('/compete/{code}', [CompetitiveGameController::class, 'show'])->name('compete.show');
    Route::post('/compete/submit', [CompetitiveGameController::class, 'submit'])->name('compete.submit');
    Route::post('/compete/timeout', [CompetitiveGameController::class, 'timeout'])->name('compete.timeout');
});

Route::middleware(['auth', \App\Http\Middleware\SetActingUser::class])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
