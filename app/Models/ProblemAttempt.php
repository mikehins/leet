<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProblemAttempt extends Model
{
    protected $fillable = [
        'user_id',
        'problem_id',
        'answer',
        'correct',
        'time_spent_seconds',
    ];

    protected function casts(): array
    {
        return [
            'correct' => 'boolean',
        ];
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
