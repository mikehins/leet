<?php

namespace App\Jobs;

use App\Enums\Grade;
use App\Events\WordProblemGenerated;
use App\Services\WordProblemService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;

class GenerateWordProblemJob implements ShouldQueue
{
    use Queueable;

    public int $timeout = 60;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $token,
        public string $grade,
        public string $locale,
        public ?int $userId = null
    ) {}

    /**
     * Execute the job.
     */
    public function handle(WordProblemService $wordProblem): void
    {
        if ($this->userId) {
            auth()->loginUsingId($this->userId);
        }

        $difficulty = Grade::tryFromGradeOrDifficulty($this->grade) ?? \App\Enums\Difficulty::Easy;

        try {
            $problem = $wordProblem->generate($difficulty, $this->locale);
        } catch (\Throwable $e) {
            report($e);

            $generator = app(\App\Services\ProblemGenerator::class);
            $problem = $generator->generate(
                \App\Enums\ProblemType::WordProblem,
                $difficulty,
                $this->locale
            );
        }

        $formatted = [
            'id' => $problem->id,
            'type' => $problem->type->value,
            'difficulty' => $problem->difficulty->value,
            'question_text' => $problem->question_text,
            'grade' => $this->grade,
        ];

        Cache::put("think_problem:{$this->token}", [
            'status' => 'ready',
            'problem' => $formatted,
        ], now()->addMinutes(10));

        broadcast(new WordProblemGenerated($this->token, $formatted));
    }
}
