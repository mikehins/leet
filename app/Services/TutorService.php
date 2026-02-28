<?php

namespace App\Services;

use App\Models\Problem;
use Illuminate\Support\Collection;
use function Laravel\Ai\agent;

class TutorService
{
    private const SYSTEM_INSTRUCTIONS = <<<'PROMPT'
        You are a friendly, encouraging math tutor for a 10-year-old. Use simple words, short sentences, and fun examples (like candies, toys, or sharing). Be warm and positive. Never use complex math terms. Keep responses under 3 sentences unless explaining steps. Never give away the answer directly—guide them to figure it out.
        PROMPT;

    public function getHint(Problem $problem, string $userAnswer, string $correctAnswer, string $locale = 'en'): string
    {
        $langInstruction = $locale === 'fr'
            ? 'Respond ONLY in French. Use simple French suitable for a 10-year-old.'
            : 'Respond in English.';

        $prompt = sprintf(
            "Math problem: %s. The student answered '%s' but the correct answer is '%s'. Give ONE fun, simple hint to help them without spoiling the answer. Use a relatable example like sharing candies or counting toys. %s",
            $problem->question_text,
            $userAnswer,
            $correctAnswer,
            $langInstruction,
        );

        $response = agent(instructions: self::SYSTEM_INSTRUCTIONS)
            ->prompt($prompt, [], 'gemini');

        return trim($response->text);
    }

    /**
     * @return Collection<int, string>
     */
    public function explainAnswer(Problem $problem, string $correctAnswer, string $locale = 'en'): Collection
    {
        $langInstruction = $locale === 'fr'
            ? 'Respond ONLY in French. Use simple French suitable for a 10-year-old.'
            : 'Respond in English.';

        $prompt = sprintf(
            "Explain why the answer is %s for this problem: %s. Give 2-4 short, fun steps a 10-year-old can follow. Use simple words and maybe a fun example. Format as a numbered list. %s",
            $correctAnswer,
            $problem->question_text,
            $langInstruction,
        );

        $response = agent(instructions: self::SYSTEM_INSTRUCTIONS)
            ->prompt($prompt, [], 'gemini');

        $text = trim($response->text);
        $lines = preg_split('/\d+[\.\)]\s*/', $text, -1, PREG_SPLIT_NO_EMPTY);

        return collect($lines)
            ->map(fn (string $line) => trim($line))
            ->filter()
            ->values();
    }

    /**
     * Chat with the tutor about a problem. Student can ask questions like a teacher.
     *
     * @param  array<int, array{role: string, content: string}>  $messages  Previous messages in the conversation
     */
    public function chat(Problem $problem, array $messages, string $locale = 'en'): string
    {
        $langInstruction = $locale === 'fr'
            ? 'Respond ONLY in French. Use simple French suitable for a 10-year-old.'
            : 'Respond in English.';

        $context = "You are a friendly, patient math tutor helping a 10-year-old solve this problem:\n\n";
        $context .= "Problem: {$problem->question_text}\n\n";
        $context .= "The correct answer is {$problem->correct_answer}, but do NOT give it away directly.\n";
        $context .= "Guide them with hints, ask leading questions, or break the problem into smaller steps.\n";
        $context .= "Keep responses short (2-4 sentences). Be encouraging. {$langInstruction}";

        $formatted = collect($messages)
            ->map(fn ($m) => "{$m['role']}: {$m['content']}")
            ->implode("\n\n");

        $prompt = $formatted
            ? "Conversation so far:\n\n{$formatted}\n\nRespond as the tutor:"
            : "The student hasn't asked anything yet. Say something welcoming and invite them to ask a question about the problem.";

        $response = agent(instructions: $context)
            ->prompt($prompt, [], 'gemini');

        return trim($response->text);
    }
}
