<?php

namespace App\Services;

use App\Enums\ProblemType;
use App\Models\AiStudentReport;
use App\Models\ReportSuggestedProgress;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use function Laravel\Ai\agent;

class ReportGeneratorService
{
    private const MIN_ATTEMPTS_FOR_REPORT = 10;

    private const SYSTEM_INSTRUCTIONS = <<<'PROMPT'
        You are an expert math educator and learning analyst writing a smart, insightful report card for a parent.
        Be warm and encouraging but also precise and actionable. Use data to back your observations.
        Identify patterns (e.g. "struggles under time pressure", "excels with visual problems").
        Give specific, actionable recommendations parents can implement at home.
        Use simple language suitable for parents. Never be harsh. Always end on an encouraging note.
        PROMPT;

    public function generateForUser(User $user, Carbon $periodStart, Carbon $periodEnd): ?AiStudentReport
    {
        $stats = $this->gatherStats($user, $periodStart, $periodEnd);

        if ($stats['total_attempts'] < self::MIN_ATTEMPTS_FOR_REPORT) {
            return null;
        }

        $locale = app()->getLocale();
        $langInstruction = $locale === 'fr'
            ? 'Respond ONLY in French. Write the report in French.'
            : 'Respond in English.';

        $prompt = $this->buildPrompt($stats, $user->name, $langInstruction);

        $response = agent(instructions: self::SYSTEM_INSTRUCTIONS)
            ->prompt($prompt, [], 'gemini');

        $parsed = $this->parseResponse(trim($response->text));

        if (! $parsed) {
            return null;
        }

        $report = AiStudentReport::create([
            'user_id' => $user->id,
            'period_start' => $periodStart,
            'period_end' => $periodEnd,
            'summary' => $parsed['summary'],
            'suggested_topics' => $parsed['suggested_topics'],
            'strengths' => $parsed['strengths'] ?? [],
            'areas_to_improve' => $parsed['areas_to_improve'] ?? [],
            'recommendations' => $parsed['recommendations'] ?? [],
            'ai_insights' => $parsed['ai_insights'] ?? [],
            'suggested_count' => 5,
        ]);

        foreach ($parsed['suggested_topics'] ?? [] as $topic) {
            if (in_array($topic, ['addition', 'subtraction', 'multiplication', 'division'], true)) {
                ReportSuggestedProgress::create([
                    'user_id' => $user->id,
                    'ai_student_report_id' => $report->id,
                    'topic' => $topic,
                    'correct_count' => 0,
                    'target_count' => 5,
                ]);
            }
        }

        return $report;
    }

    /**
     * @return array{total_attempts: int, correct_attempts: int, accuracy: int, by_type: array, streak: int, total_xp: int}
     */
    private function gatherStats(User $user, Carbon $periodStart, Carbon $periodEnd): array
    {
        $attempts = $user->problemAttempts()
            ->whereBetween('created_at', [$periodStart, $periodEnd])
            ->with('problem')
            ->get();

        $correctAttempts = $attempts->where('correct', true);
        $byType = collect(ProblemType::cases())
            ->filter(fn ($t) => $t !== ProblemType::WordProblem)
            ->mapWithKeys(fn ($type) => [
                $type->value => [
                    'total' => $attempts->filter(fn ($a) => $a->problem?->type === $type)->count(),
                    'correct' => $correctAttempts->filter(fn ($a) => $a->problem?->type === $type)->count(),
                ],
            ])
            ->filter(fn ($v) => $v['total'] > 0)
            ->all();

        $progress = $user->progress;
        $totalXp = $progress?->total_points ?? 0;

        $avgTimeCorrect = $correctAttempts->filter(fn ($a) => $a->time_spent_seconds > 0)->avg('time_spent_seconds');
        $avgTimeWrong = $attempts->where('correct', false)->filter(fn ($a) => $a->time_spent_seconds > 0)->avg('time_spent_seconds');
        $fastCorrect = $correctAttempts->where('time_spent_seconds', '<=', 5)->count();

        return [
            'total_attempts' => $attempts->count(),
            'correct_attempts' => $correctAttempts->count(),
            'accuracy' => $attempts->count() > 0
                ? (int) round(100 * $correctAttempts->count() / $attempts->count())
                : 0,
            'by_type' => $byType,
            'streak' => $progress?->current_streak ?? 0,
            'total_xp' => $totalXp,
            'avg_time_correct_seconds' => $avgTimeCorrect ? (int) round($avgTimeCorrect) : null,
            'avg_time_wrong_seconds' => $avgTimeWrong ? (int) round($avgTimeWrong) : null,
            'fast_correct_count' => $fastCorrect,
        ];
    }

    private function buildPrompt(array $stats, string $childName, string $langInstruction): string
    {
        $byTypeLines = collect($stats['by_type'] ?? [])->map(function ($data, $type) {
            $acc = $data['total'] > 0 ? (int) round(100 * $data['correct'] / $data['total']) : 0;
            return "- {$type}: {$data['correct']}/{$data['total']} correct ({$acc}%)";
        })->implode("\n");

        $timeInfo = '';
        if (isset($stats['avg_time_correct_seconds']) && isset($stats['avg_time_wrong_seconds'])) {
            $timeInfo = "\n- Avg time when correct: {$stats['avg_time_correct_seconds']}s | when wrong: {$stats['avg_time_wrong_seconds']}s";
        }
        if (isset($stats['fast_correct_count']) && $stats['fast_correct_count'] > 0) {
            $timeInfo .= "\n- Fast correct answers (≤5s): {$stats['fast_correct_count']}";
        }

        return <<<PROMPT
        Write a smart, insightful report card for {$childName}'s math progress.

        Stats for the period:
        - Total: {$stats['correct_attempts']}/{$stats['total_attempts']} correct ({$stats['accuracy']}% accuracy)
        - Current streak: {$stats['streak']} days
        - Total XP: {$stats['total_xp']}{$timeInfo}

        By topic:
        {$byTypeLines}

        Respond with a JSON object (no markdown, no code block) with exactly these keys:
        - "summary": string (3-5 sentences, warm but insightful - mention specific patterns you see in the data)
        - "suggested_topics": array of 1-3 topic slugs (only: addition, subtraction, multiplication, division - pick the weakest)
        - "strengths": array of 2-4 short strings (be specific, reference the data)
        - "areas_to_improve": array of 2-4 short strings (specific, actionable)
        - "recommendations": array of 3-5 actionable recommendations for the parent (e.g. "Practice 5 division problems before bed 3x/week", "Use flashcards for multiplication tables 7-9")
        - "ai_insights": array of 2-3 short insights about learning patterns (e.g. "Accuracy drops on harder problems - may need more scaffolding", "Fast on correct answers - good mental math foundation")

        {$langInstruction}
        PROMPT;
    }

    /**
     * @return array{summary: string, suggested_topics: array, strengths?: array, areas_to_improve?: array}|null
     */
    private function parseResponse(string $text): ?array
    {
        $text = preg_replace('/^```\w*\s*/', '', $text);
        $text = preg_replace('/\s*```\s*$/', '', $text);
        $text = trim($text);

        $decoded = json_decode($text, true);
        if (! is_array($decoded) || empty($decoded['summary'])) {
            return null;
        }

        return [
            'summary' => $decoded['summary'],
            'suggested_topics' => $decoded['suggested_topics'] ?? [],
            'strengths' => $decoded['strengths'] ?? [],
            'areas_to_improve' => $decoded['areas_to_improve'] ?? [],
            'recommendations' => $decoded['recommendations'] ?? [],
            'ai_insights' => $decoded['ai_insights'] ?? [],
        ];
    }

    /**
     * Get chart data for accuracy over time (last 30 days) and by topic.
     *
     * @return array{accuracy_over_time: array, accuracy_by_topic: array}
     */
    public function getChartData(User $user): array
    {
        $thirtyDaysAgo = now()->subDays(30);

        $attempts = $user->problemAttempts()
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->with('problem')
            ->get();

        $byDate = $attempts->groupBy(fn ($a) => $a->created_at->format('Y-m-d'));
        $accuracyOverTime = collect($byDate)->map(function ($dayAttempts, $date) {
            $total = $dayAttempts->count();
            $correct = $dayAttempts->where('correct', true)->count();
            return [
                'date' => $date,
                'accuracy' => $total > 0 ? (int) round(100 * $correct / $total) : 0,
                'total' => $total,
                'correct' => $correct,
            ];
        })->sortKeys()->values()->toArray();

        $byType = collect(ProblemType::cases())
            ->filter(fn ($t) => $t !== ProblemType::WordProblem)
            ->map(function ($type) use ($attempts) {
                $typeAttempts = $attempts->filter(fn ($a) => $a->problem?->type === $type);
                $total = $typeAttempts->count();
                $correct = $typeAttempts->where('correct', true)->count();
                return [
                    'topic' => $type->value,
                    'accuracy' => $total > 0 ? (int) round(100 * $correct / $total) : 0,
                    'total' => $total,
                    'correct' => $correct,
                ];
            })
            ->filter(fn ($d) => $d['total'] > 0)
            ->values()
            ->toArray();

        return [
            'accuracy_over_time' => $accuracyOverTime,
            'accuracy_by_topic' => $byType,
        ];
    }

    /**
     * Answer a parent's question about the student's report using AI.
     */
    public function answerQuestion(User $targetUser, string $question, ?AiStudentReport $report = null): string
    {
        $locale = app()->getLocale();
        $langInstruction = $locale === 'fr' ? 'Respond ONLY in French.' : 'Respond in English.';

        $reports = $targetUser->aiStudentReports()->orderByDesc('period_end')->limit(3)->get();
        $reportContext = $reports->map(fn ($r) => "Period {$r->period_start->format('Y-m-d')} to {$r->period_end->format('Y-m-d')}: {$r->summary}")->implode("\n\n");

        $percentiles = $this->computePercentiles($targetUser);
        $chartData = $this->getChartData($targetUser);

        $statsContext = "Accuracy: {$percentiles['accuracy']}%. Percentile vs all users: " . ($percentiles['percentile_vs_users'] ?? 'N/A') . ". ";
        $statsContext .= "By topic: " . collect($chartData['accuracy_by_topic'])->map(fn ($t) => "{$t['topic']} {$t['accuracy']}%")->implode(', ');

        $prompt = "A parent is asking about {$targetUser->name}'s math progress.\n\n";
        $prompt .= "Recent report summaries:\n{$reportContext}\n\n";
        $prompt .= "Current stats: {$statsContext}\n\n";
        $prompt .= "Parent's question: {$question}\n\n";
        $prompt .= "Give a helpful, warm, specific answer (2-5 sentences). Be encouraging. {$langInstruction}";

        $response = agent(instructions: self::SYSTEM_INSTRUCTIONS)
            ->prompt($prompt, [], 'gemini');

        return trim($response->text);
    }

    /**
     * Compute percentile: what % of users have LOWER accuracy than this user?
     * Higher percentile = better. 75th percentile = better than 75% of users.
     */
    public function computePercentiles(User $user): array
    {
        $userAccuracy = $this->getUserAccuracy($user);
        $userCountry = $user->country;

        $allUsersAccuracy = DB::table('problem_attempts')
            ->select('user_id')
            ->selectRaw('COUNT(*) as total, SUM(CASE WHEN correct THEN 1 ELSE 0 END) as correct')
            ->groupBy('user_id')
            ->having('total', '>=', 5)
            ->get();

        $allAccuracies = $allUsersAccuracy->map(function ($row) {
            return $row->total > 0 ? (int) round(100 * $row->correct / $row->total) : 0;
        })->sort()->values();

        $percentileVsUsers = $this->percentileRank($userAccuracy, $allAccuracies);

        $countryPercentile = null;
        if ($userCountry && $allUsersAccuracy->isNotEmpty()) {
            $userIdsByCountry = User::where('country', $userCountry)->pluck('id')->toArray();
            $countryAccuracies = $allUsersAccuracy
                ->filter(fn ($row) => in_array($row->user_id, $userIdsByCountry, true))
                ->map(fn ($row) => $row->total > 0 ? (int) round(100 * $row->correct / $row->total) : 0)
                ->sort()
                ->values();

            if ($countryAccuracies->isNotEmpty()) {
                $countryPercentile = $this->percentileRank($userAccuracy, $countryAccuracies);
            }
        }

        return [
            'accuracy' => $userAccuracy,
            'percentile_vs_users' => $percentileVsUsers,
            'percentile_vs_country' => $countryPercentile,
            'country' => $userCountry,
        ];
    }

    private function getUserAccuracy(User $user): int
    {
        $attempts = $user->problemAttempts();
        $total = $attempts->count();
        if ($total < 5) {
            return 0;
        }
        $correct = $user->problemAttempts()->where('correct', true)->count();

        return (int) round(100 * $correct / $total);
    }

    /**
     * @param  \Illuminate\Support\Collection<int, int>  $sortedValues
     */
    private function percentileRank(int $value, $sortedValues): ?int
    {
        if ($sortedValues->isEmpty()) {
            return null;
        }

        $count = $sortedValues->count();
        $below = $sortedValues->filter(fn ($v) => $v < $value)->count();
        $same = $sortedValues->filter(fn ($v) => $v === $value)->count();

        $percentile = (int) round(100 * ($below + 0.5 * $same) / $count);

        return min(99, max(1, $percentile));
    }
}
