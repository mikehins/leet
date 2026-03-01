<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $locale = app()->getLocale();
        $path = lang_path("{$locale}.json");
        $translations = file_exists($path)
            ? (json_decode(file_get_contents($path), true) ?? [])
            : [];

        $user = $request->user();
        $parent = $user?->parent_id ? $user->parent : $user;
        $canSwitchProfile = $parent && $parent->children()->count() > 0;
        $actingAsChild = $user?->parent_id !== null;

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'can_switch_profile' => $canSwitchProfile,
                'acting_as_child' => $actingAsChild,
            ],
            'locale' => $locale,
            'translations' => $translations,
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'unreadNotificationsCount' => $user?->unreadNotifications()->count() ?? 0,
            'pendingFriendRequestsCount' => $user
                ? \App\Models\FriendRequest::where('receiver_id', $user->id)->where('status', 'pending')->count()
                : 0,
        ];
    }
}
