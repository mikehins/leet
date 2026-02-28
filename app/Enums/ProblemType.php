<?php

namespace App\Enums;

enum ProblemType: string
{
    case Addition = 'addition';
    case Subtraction = 'subtraction';
    case Multiplication = 'multiplication';
    case Division = 'division';
    case WordProblem = 'word_problem';

    public function label(): string
    {
        return match ($this) {
            self::Addition => 'Addition',
            self::Subtraction => 'Subtraction',
            self::Multiplication => 'Multiplication',
            self::Division => 'Division',
            self::WordProblem => 'Word Problem',
        };
    }

    public function symbol(): string
    {
        return match ($this) {
            self::Addition => '+',
            self::Subtraction => '−',
            self::Multiplication => '×',
            self::Division => '÷',
            self::WordProblem => '?',
        };
    }
}
