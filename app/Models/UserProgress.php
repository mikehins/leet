<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProgress extends Model
{
    protected $table = 'user_progress';

    protected $fillable = [
        'user_id',
        'level',
        'total_points',
        'current_streak',
        'longest_streak',
        'login_streak',
        'last_login_date',
        'daily_quest_completed_at',
        'chat_questions_count',
        'last_activity_date',
    ];

    protected function casts(): array
    {
        return [
            'last_activity_date' => 'date',
            'last_login_date' => 'date',
            'daily_quest_completed_at' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function getOrCreateFor(User $user): self
    {
        $progress = $user->progress;

        if (! $progress) {
            $progress = $user->progress()->create([
                'level' => 1,
                'total_points' => 0,
                'current_streak' => 0,
                'longest_streak' => 0,
            ]);
        }

        return $progress;
    }
}
