<?php

namespace App\Services;

use App\Enums\Difficulty;
use App\Enums\ProblemType;
use App\Models\Problem;
use InvalidArgumentException;

class ProblemGenerator
{
    public function generate(ProblemType $type, Difficulty $difficulty, string $locale = 'en'): Problem
    {
        return match ($type) {
            ProblemType::Addition => $this->generateAddition($difficulty),
            ProblemType::Subtraction => $this->generateSubtraction($difficulty),
            ProblemType::Multiplication => $this->generateMultiplication($difficulty),
            ProblemType::Division => $this->generateDivision($difficulty),
            ProblemType::WordProblem => $this->generateWordProblem($difficulty, $locale),
        };
    }

    public function generateRandom(?Difficulty $difficulty = null): Problem
    {
        $difficulty ??= Difficulty::Easy;
        $types = [ProblemType::Addition, ProblemType::Subtraction, ProblemType::Multiplication, ProblemType::Division];
        $type = $types[array_rand($types)];

        return $this->generate($type, $difficulty);
    }

    private function randomNumber(int $minDigits, int $maxDigits): int
    {
        $min = (int) str_pad('1', $minDigits, '0');
        $max = (int) str_repeat('9', $maxDigits);

        return random_int($min, $max);
    }

    private function generateAddition(Difficulty $difficulty): Problem
    {
        $a = $this->randomNumber($difficulty->minDigits(), $difficulty->maxDigits());
        $b = $this->randomNumber($difficulty->minDigits(), $difficulty->maxDigits());
        $answer = $a + $b;

        return Problem::create([
            'type' => ProblemType::Addition,
            'difficulty' => $difficulty,
            'question_text' => "{$a} + {$b} = ?",
            'correct_answer' => (string) $answer,
            'metadata' => ['a' => $a, 'b' => $b],
        ]);
    }

    private function generateSubtraction(Difficulty $difficulty): Problem
    {
        $a = $this->randomNumber($difficulty->minDigits(), $difficulty->maxDigits());
        $b = $this->randomNumber($difficulty->minDigits(), min($difficulty->maxDigits(), strlen((string) $a)));
        if ($b > $a) {
            [$a, $b] = [$b, $a];
        }
        $answer = $a - $b;

        return Problem::create([
            'type' => ProblemType::Subtraction,
            'difficulty' => $difficulty,
            'question_text' => "{$a} − {$b} = ?",
            'correct_answer' => (string) $answer,
            'metadata' => ['a' => $a, 'b' => $b],
        ]);
    }

    private function generateMultiplication(Difficulty $difficulty): Problem
    {
        $max = match ($difficulty) {
            Difficulty::Easy => 12,
            Difficulty::Medium => 15,
            Difficulty::Hard => 20,
        };
        $a = random_int(1, $max);
        $b = random_int(1, $max);
        $answer = $a * $b;

        return Problem::create([
            'type' => ProblemType::Multiplication,
            'difficulty' => $difficulty,
            'question_text' => "{$a} × {$b} = ?",
            'correct_answer' => (string) $answer,
            'metadata' => ['a' => $a, 'b' => $b],
        ]);
    }

    private function generateDivision(Difficulty $difficulty): Problem
    {
        $max = match ($difficulty) {
            Difficulty::Easy => 12,
            Difficulty::Medium => 15,
            Difficulty::Hard => 20,
        };
        $b = random_int(1, $max);
        $quotient = random_int(1, $max);
        $a = $b * $quotient;

        return Problem::create([
            'type' => ProblemType::Division,
            'difficulty' => $difficulty,
            'question_text' => "{$a} ÷ {$b} = ?",
            'correct_answer' => (string) $quotient,
            'metadata' => ['a' => $a, 'b' => $b, 'quotient' => $quotient],
        ]);
    }

    private function generateWordProblem(Difficulty $difficulty, string $locale = 'en'): Problem
    {
        $templates = $locale === 'fr'
            ? [
                ['Emma a {a} pommes. Elle en achète {b} de plus. Combien de pommes a-t-elle maintenant?', 'addition'],
                ['Il y a {a} oiseaux sur un arbre. {b} s\'envolent. Combien en reste-t-il?', 'subtraction'],
                ['Jake a {a} sacs avec {b} billes chacun. Combien de billes a-t-il?', 'multiplication'],
                ['{a} biscuits sont partagés équitablement entre {b} amis. Combien chacun en a-t-il?', 'division'],
            ]
            : [
                ['Emma has {a} apples. She buys {b} more. How many apples does she have now?', 'addition'],
                ['There are {a} birds on a tree. {b} fly away. How many are left?', 'subtraction'],
                ['Jake has {a} bags with {b} marbles each. How many marbles does he have?', 'multiplication'],
                ['{a} cookies are shared equally among {b} friends. How many does each get?', 'division'],
            ];

        $template = $templates[array_rand($templates)];
        [$text, $op] = $template;

        $a = $this->randomNumber($difficulty->minDigits(), $difficulty->maxDigits());
        $b = $this->randomNumber($difficulty->minDigits(), $difficulty->maxDigits());

        $answer = match ($op) {
            'addition' => $a + $b,
            'subtraction' => max(0, $a - $b),
            'multiplication' => $a * $b,
            'division' => $b > 0 ? (int) floor($a / $b) : 0,
            default => throw new InvalidArgumentException("Unknown op: {$op}"),
        };

        if ($op === 'subtraction' && $b > $a) {
            [$a, $b] = [$b, $a];
            $answer = $a - $b;
        }
        if ($op === 'division') {
            $a = $b * $answer;
        }

        $questionText = str_replace(['{a}', '{b}'], [$a, $b], $text);

        return Problem::create([
            'type' => ProblemType::WordProblem,
            'difficulty' => $difficulty,
            'question_text' => $questionText,
            'correct_answer' => (string) $answer,
            'metadata' => ['a' => $a, 'b' => $b, 'operation' => $op],
        ]);
    }
}
