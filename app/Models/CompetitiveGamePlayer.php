<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompetitiveGamePlayer extends Model
{
    protected $table = 'competitive_game_players';

    protected $fillable = ['user_id', 'score', 'grade'];

    public function game(): BelongsTo
    {
        return $this->belongsTo(CompetitiveGame::class, 'competitive_game_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
