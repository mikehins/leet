<?php

namespace App\Enums;

enum Grade: string
{
    case Grade3 = 'grade_3';
    case Grade4 = 'grade_4';
    case Grade5 = 'grade_5';
    case Grade6 = 'grade_6';

    public function toDifficulty(): Difficulty
    {
        return match ($this) {
            self::Grade3 => Difficulty::Easy,
            self::Grade4 => Difficulty::Easy,
            self::Grade5 => Difficulty::Medium,
            self::Grade6 => Difficulty::Hard,
        };
    }

    public static function tryFromGradeOrDifficulty(?string $value): ?Difficulty
    {
        if (! $value) {
            return Difficulty::Easy;
        }

        $grade = self::tryFrom($value);
        if ($grade) {
            return $grade->toDifficulty();
        }

        return Difficulty::tryFrom($value);
    }
}
