<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class FacebookAuthController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('facebook')
            ->scopes(['email'])
            ->redirect();
    }

    public function callback()
    {
        $facebookUser = Socialite::driver('facebook')->user();

        $user = User::where('facebook_id', $facebookUser->getId())->first();

        if ($user) {
            $user->update([
                'avatar' => $facebookUser->getAvatar(),
            ]);
        } else {
            $email = $facebookUser->getEmail();
            if (!$email) {
                return redirect()->route('login')->with('error', __('auth.facebook_email_required'));
            }

            $user = User::where('email', $email)->first();

            if ($user) {
                $user->update([
                    'facebook_id' => $facebookUser->getId(),
                    'avatar' => $facebookUser->getAvatar(),
                ]);
            } else {
                $user = User::create([
                    'name' => $facebookUser->getName(),
                    'email' => $email,
                    'facebook_id' => $facebookUser->getId(),
                    'avatar' => $facebookUser->getAvatar(),
                    'email_verified_at' => now(),
                ]);
            }
        }

        Auth::login($user, true);

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
