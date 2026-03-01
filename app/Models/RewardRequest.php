<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RewardRequest extends Model
{
    protected $fillable = [
        'user_id',
        'points_spent',
        'dollars_value',
        'status',
        'message',
        'reward_tier',
        'parent_notified_at',
    ];

    protected function casts(): array
    {
        return [
            'parent_notified_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function pointsToDollars(int $points): float
    {
        $rate = config('game.points_per_dollar', 100);

        return round($points / $rate, 2);
    }

    public static function dollarsToPoints(float $dollars): int
    {
        $rate = config('game.points_per_dollar', 100);

        return (int) round($dollars * $rate);
    }
}
