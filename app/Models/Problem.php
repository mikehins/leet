<?php

namespace App\Models;

use App\Enums\Difficulty;
use App\Enums\ProblemType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Problem extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'difficulty',
        'question_text',
        'correct_answer',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'type' => ProblemType::class,
            'difficulty' => Difficulty::class,
            'metadata' => 'array',
        ];
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(ProblemAttempt::class);
    }

    public function isCorrect(string $answer): bool
    {
        return trim((string) $answer) === trim($this->correct_answer);
    }
}
