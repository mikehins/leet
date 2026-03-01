<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $fillable = ['user_id', 'type', 'data', 'read_at'];

    protected function casts(): array
    {
        return [
            'data' => 'array',
            'read_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isRead(): bool
    {
        return $this->read_at !== null;
    }

    public function markAsRead(): void
    {
        $this->update(['read_at' => now()]);
    }

    public static function createFriendBadgeEarned(int $recipientUserId, User $actor, Badge $badge): self
    {
        return self::create([
            'user_id' => $recipientUserId,
            'type' => 'friend_badge_earned',
            'data' => [
                'actor_id' => $actor->id,
                'actor_name' => $actor->name,
                'badge_id' => $badge->id,
                'badge_name_key' => $badge->name_key,
            ],
        ]);
    }
}
