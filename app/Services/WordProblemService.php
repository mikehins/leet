<?php

namespace App\Services;

use App\Enums\Difficulty;
use App\Enums\ProblemType;
use App\Models\Problem;
use function Laravel\Ai\agent;

class WordProblemService
{
    private const SYSTEM_PROMPT = <<<'PROMPT'
        You are a friendly math teacher creating word problems for kids ages 8–12.
        Generate ONE creative, engaging word problem. Use fun scenarios: candies, toys, pets, sports, sharing with friends, etc.
        The problem must be solvable with basic arithmetic (addition, subtraction, multiplication, or division).
        Output ONLY valid JSON with exactly these keys:
        - "question": the word problem text (2-4 sentences, clear and engaging)
        - "answer": the numeric answer as a string (e.g. "42")
        - "operation": one of "addition", "subtraction", "multiplication", "division"
        No other text. Just the JSON object.
        PROMPT;

    public function generate(Difficulty $difficulty, string $locale = 'en'): Problem
    {
        $isFrench = $locale === 'fr';
        $systemPrompt = self::SYSTEM_PROMPT;
        if ($isFrench) {
            $systemPrompt .= "\n\nIMPORTANT: When asked for French, write the \"question\" field entirely in French. Use simple French suitable for kids.";
        }
        $langInstruction = $isFrench
            ? 'Write the "question" in French. French only.'
            : 'Write the question in English.';

        $difficultyHint = match ($difficulty) {
            Difficulty::Easy => 'Use small numbers (1-20). Single operation.',
            Difficulty::Medium => 'Use numbers up to 100. May involve 2 steps.',
            Difficulty::Hard => 'Use numbers up to 500. Can involve multi-step reasoning.',
        };

        $prompt = "{$langInstruction} Create a word problem. Difficulty: {$difficulty->value}. {$difficultyHint} Output valid JSON with question, answer (numeric string), and operation.";

        $response = agent(instructions: $systemPrompt)
            ->prompt($prompt, [], 'gemini');

        $text = trim($response->text);
        $text = preg_replace('/^```json\s*|\s*```$/m', '', $text);
        $data = json_decode($text, true);

        if (! $data || ! isset($data['question'], $data['answer'])) {
            return $this->fallbackProblem($difficulty, $locale);
        }

        $operation = $data['operation'] ?? 'addition';

        return Problem::create([
            'type' => ProblemType::WordProblem,
            'difficulty' => $difficulty,
            'question_text' => trim($data['question']),
            'correct_answer' => (string) $data['answer'],
            'metadata' => ['operation' => $operation, 'ai_generated' => true],
        ]);
    }

    private function fallbackProblem(Difficulty $difficulty, string $locale = 'en'): Problem
    {
        $generator = app(ProblemGenerator::class);

        return $generator->generate(ProblemType::WordProblem, $difficulty, $locale);
    }
}
