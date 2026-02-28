<?php

namespace App\Enums;

enum Difficulty: string
{
    case Easy = 'easy';
    case Medium = 'medium';
    case Hard = 'hard';

    public function label(): string
    {
        return match ($this) {
            self::Easy => 'Easy',
            self::Medium => 'Medium',
            self::Hard => 'Hard',
        };
    }

    public function maxDigits(): int
    {
        return match ($this) {
            self::Easy => 2,
            self::Medium => 3,
            self::Hard => 4,
        };
    }

    public function minDigits(): int
    {
        return match ($this) {
            self::Easy => 1,
            self::Medium => 2,
            self::Hard => 3,
        };
    }
}
