<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class SetActingUser
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();
        if (!$user) {
            return $next($request);
        }

        $profileId = session('active_profile_id');
        if ($profileId && $user->children()->where('id', $profileId)->exists()) {
            $child = User::find($profileId);
            if ($child) {
                Auth::setUser($child);
            }
        }

        return $next($request);
    }
}
