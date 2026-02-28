<?php

namespace Database\Factories;

use App\Enums\Difficulty;
use App\Enums\ProblemType;
use App\Models\Problem;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProblemFactory extends Factory
{
    protected $model = Problem::class;

    public function definition(): array
    {
        $a = $this->faker->numberBetween(1, 20);
        $b = $this->faker->numberBetween(1, 20);

        return [
            'type' => ProblemType::Addition,
            'difficulty' => Difficulty::Easy,
            'question_text' => "{$a} + {$b} = ?",
            'correct_answer' => (string) ($a + $b),
            'metadata' => ['a' => $a, 'b' => $b],
        ];
    }
}
