<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function problemAttempts(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProblemAttempt::class);
    }

    public function progress(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(UserProgress::class);
    }

    public function aiCalls(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(AiCall::class);
    }

    public function badges(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Badge::class, 'badge_user')
            ->withPivot('earned_at')
            ->withTimestamps();
    }
}
