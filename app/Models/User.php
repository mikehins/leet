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
        'avatar',
        'parent_email',
        'google_id',
        'github_id',
        'facebook_id',
        'parent_id',
        'country',
        'require_suggested_practice_before_compete',
    ];

    protected $appends = ['avatar_url'];

    public function getAvatarUrlAttribute(): ?string
    {
        if (!$this->avatar) {
            return null;
        }
        if (str_starts_with($this->avatar, 'http')) {
            return $this->avatar;
        }
        return \Illuminate\Support\Facades\Storage::disk('public')->url($this->avatar);
    }

    public function parent(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    public function children(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(User::class, 'parent_id');
    }

    public function isParent(): bool
    {
        return $this->parent_id === null;
    }

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
            'require_suggested_practice_before_compete' => 'boolean',
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

    public function friendRequestsSent(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(FriendRequest::class, 'sender_id');
    }

    public function friendRequestsReceived(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(FriendRequest::class, 'receiver_id');
    }

    public function notifications(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function unreadNotifications(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Notification::class)->whereNull('read_at');
    }

    public function aiStudentReports(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(AiStudentReport::class);
    }

    public function rewardRequests(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(RewardRequest::class);
    }

    public function parentEmail(): ?string
    {
        return $this->parent_email ?: $this->email;
    }

    /** Users who are friends (either direction of accepted request). */
    public function friendsList(): \Illuminate\Support\Collection
    {
        $sent = FriendRequest::where('sender_id', $this->id)->where('status', 'accepted')
            ->with('receiver')->get()->pluck('receiver');
        $received = FriendRequest::where('receiver_id', $this->id)->where('status', 'accepted')
            ->with('sender')->get()->pluck('sender');
        return $sent->merge($received)->unique('id')->values();
    }
}
