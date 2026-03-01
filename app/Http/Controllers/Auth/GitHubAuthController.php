<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GitHubAuthController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('github')->redirect();
    }

    public function callback()
    {
        $githubUser = Socialite::driver('github')->user();

        $user = User::where('github_id', $githubUser->getId())->first();

        if ($user) {
            $user->update([
                'avatar' => $githubUser->getAvatar(),
            ]);
        } else {
            $email = $githubUser->getEmail();
            if (!$email) {
                return redirect()->route('login')->with('error', __('auth.github_email_required'));
            }

            $user = User::where('email', $email)->first();

            if ($user) {
                $user->update([
                    'github_id' => $githubUser->getId(),
                    'avatar' => $githubUser->getAvatar(),
                ]);
            } else {
                $user = User::create([
                    'name' => $githubUser->getName() ?: $githubUser->getNickname(),
                    'email' => $email,
                    'github_id' => $githubUser->getId(),
                    'avatar' => $githubUser->getAvatar(),
                    'email_verified_at' => now(),
                ]);
            }
        }

        Auth::login($user, true);

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
