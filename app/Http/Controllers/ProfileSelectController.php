<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileSelectController extends Controller
{
    public function index(): Response
    {
        $actingUser = Auth::user();
        $parent = $actingUser->parent_id ? $actingUser->parent : $actingUser;
        $children = $parent->children()->orderBy('name')->get();

        $profiles = collect([
            [
                'id' => $parent->id,
                'name' => $parent->name,
                'avatar_url' => $parent->avatar_url,
                'is_parent' => true,
            ],
        ])->merge(
            $children->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'avatar_url' => $c->avatar_url,
                'is_parent' => false,
            ])
        );

        return Inertia::render('ProfileSelect/Index', [
            'profiles' => $profiles,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $actingUser = Auth::user();
        $parent = $actingUser->parent_id ? $actingUser->parent : $actingUser;

        $request->validate([
            'user_id' => 'required|integer',
        ]);

        $profileId = (int) $request->user_id;

        if ($profileId === $parent->id) {
            session()->put('active_profile_id', null);
            return redirect()->intended(route('dashboard', absolute: false));
        }

        if ($parent->children()->where('id', $profileId)->exists()) {
            session()->put('active_profile_id', $profileId);
            return redirect()->intended(route('dashboard', absolute: false));
        }

        abort(403);
    }
}
