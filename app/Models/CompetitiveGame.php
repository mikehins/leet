<?php

namespace App\Models;

use App\Enums\Difficulty;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class CompetitiveGame extends Model
{
    protected $table = 'competitive_games';

    protected $fillable = [
        'code',
        'status',
        'difficulty',
        'total_rounds',
        'current_round',
        'current_problem_id',
        'round_ends_at',
    ];

    protected function casts(): array
    {
        return [
            'round_ends_at' => 'datetime',
            'difficulty' => Difficulty::class,
        ];
    }

    public function players(): HasMany
    {
        return $this->hasMany(CompetitiveGamePlayer::class, 'competitive_game_id');
    }

    public function rounds(): HasMany
    {
        return $this->hasMany(CompetitiveGameRound::class, 'competitive_game_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(CompetitiveGameAnswer::class, 'competitive_game_id');
    }

    public function currentProblem(): BelongsTo
    {
        return $this->belongsTo(Problem::class, 'current_problem_id');
    }

    public static function generateCode(): string
    {
        do {
            $code = (string) random_int(1000, 9999);
        } while (self::where('code', $code)->exists());

        return $code;
    }

    public function isWaiting(): bool
    {
        return $this->status === 'waiting';
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isFinished(): bool
    {
        return $this->status === 'finished';
    }

    public function hasPlayer(User $user): bool
    {
        return $this->players()->where('user_id', $user->id)->exists();
    }

    public function getPlayer(User $user): ?CompetitiveGamePlayer
    {
        return $this->players()->where('user_id', $user->id)->first();
    }
}
