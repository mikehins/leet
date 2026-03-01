<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class FamiliesController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();

        if ($user->parent_id !== null) {
            abort(403, 'Only parents can manage family accounts.');
        }

        $children = $user->children()->orderBy('name')->get();

        return Inertia::render('Family/Index', [
            'children' => $children,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = Auth::user();

        if ($user->parent_id !== null) {
            abort(403, 'Only parents can add child accounts.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'parent_id' => $user->id,
            'parent_email' => $user->email,
        ]);

        return redirect()->route('family.index')->with('success', __('family.child_added'));
    }
}
