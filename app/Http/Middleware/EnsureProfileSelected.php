<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureProfileSelected
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();
        if (!$user || $user->parent_id !== null) {
            return $next($request);
        }

        if (session()->has('active_profile_id')) {
            return $next($request);
        }

        if ($user->children()->count() === 0) {
            return $next($request);
        }

        if ($request->routeIs('profile-select') || $request->routeIs('profile-select.store')) {
            return $next($request);
        }

        return redirect()->route('profile-select');
    }
}
