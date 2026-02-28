<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompetitiveGameRound extends Model
{
    protected $table = 'competitive_game_rounds';

    protected $fillable = ['problem_id', 'round_number', 'user_id'];

    public function game(): BelongsTo
    {
        return $this->belongsTo(CompetitiveGame::class, 'competitive_game_id');
    }

    public function problem(): BelongsTo
    {
        return $this->belongsTo(Problem::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
