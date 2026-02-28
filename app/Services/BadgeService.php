<?php

namespace App\Services;

use App\Enums\ProblemType;
use App\Models\Badge;
use App\Models\User;
use Illuminate\Support\Collection;

class BadgeService
{
    /**
     * Check and award any newly earned badges. Returns collection of newly awarded badges.
     *
     * @return Collection<int, Badge>
     */
    public function checkAndAward(User $user, string $context, array $contextData = []): Collection
    {
        $newlyAwarded = collect();
        $progress = $user->progress;
        $progress = $progress ?: \App\Models\UserProgress::getOrCreateFor($user);

        $correctCount = $user->problemAttempts()->where('correct', true)->count();
        $thinkSolved = $user->problemAttempts()
            ->whereHas('problem', fn ($q) => $q->where('type', ProblemType::WordProblem))
            ->where('correct', true)
            ->count();
        $correctByType = collect(ProblemType::cases())
            ->filter(fn ($t) => $t !== ProblemType::WordProblem)
            ->mapWithKeys(fn ($type) => [
                $type->value => $user->problemAttempts()
                    ->where('correct', true)
                    ->whereHas('problem', fn ($q) => $q->where('type', $type))
                    ->count(),
            ]);
        $chatCount = $this->getChatCount($user);
        $totalXp = $progress->total_points ?? 0;
        $currentStreak = $progress->current_streak ?? 0;
        $longestStreak = $progress->longest_streak ?? 0;

        $badges = Badge::orderBy('sort_order')->get();

        foreach ($badges as $badge) {
            if ($badge->hasUser($user)) {
                continue;
            }

            $criteria = $badge->criteria_value ?? [];
            $award = false;

            switch ($badge->criteria_type) {
                case 'correct_count':
                    $award = $correctCount >= ($criteria['count'] ?? 0);
                    break;
                case 'streak':
                    $days = $criteria['days'] ?? 0;
                    $award = $currentStreak >= $days || $longestStreak >= $days;
                    break;
                case 'speed':
                    $award = $context === 'play_submit'
                        && ($contextData['time_spent_seconds'] ?? 999) <= ($criteria['seconds'] ?? 10)
                        && ($contextData['correct'] ?? false);
                    break;
                case 'combo':
                    $award = $context === 'play_submit'
                        && ($contextData['combo_count'] ?? 0) >= ($criteria['count'] ?? 5)
                        && ($contextData['correct'] ?? false);
                    break;
                case 'think_solved':
                    $award = $thinkSolved >= ($criteria['count'] ?? 1);
                    break;
                case 'chat_count':
                    $award = $chatCount >= ($criteria['count'] ?? 5);
                    break;
                case 'total_xp':
                    $award = $totalXp >= ($criteria['xp'] ?? 0);
                    break;
                case 'correct_by_type':
                    $type = $criteria['type'] ?? null;
                    $count = $criteria['count'] ?? 0;
                    $award = $type && ($correctByType[$type] ?? 0) >= $count;
                    break;
            }

            if ($award) {
                $user->badges()->attach($badge->id, ['earned_at' => now()]);
                $newlyAwarded->push($badge);
            }
        }

        return $newlyAwarded;
    }

    private function getChatCount(User $user): int
    {
        $progress = $user->progress;

        return $progress?->chat_questions_count ?? 0;
    }
}
