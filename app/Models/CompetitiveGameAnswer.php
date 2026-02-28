<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompetitiveGameAnswer extends Model
{
    protected $table = 'competitive_game_answers';

    protected $fillable = ['competitive_game_id', 'user_id', 'problem_id', 'answer', 'correct', 'time_spent_seconds'];

    protected function casts(): array
    {
        return [
            'correct' => 'boolean',
        ];
    }

    public function game(): BelongsTo
    {
        return $this->belongsTo(CompetitiveGame::class, 'competitive_game_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function problem(): BelongsTo
    {
        return $this->belongsTo(Problem::class);
    }
}
