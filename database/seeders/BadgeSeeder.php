<?php

namespace Database\Seeders;

use App\Models\Badge;
use Illuminate\Database\Seeder;

class BadgeSeeder extends Seeder
{
    public function run(): void
    {
        $badges = [
            ['slug' => 'first_correct', 'name_key' => 'badge.first_correct', 'description_key' => 'badge.first_correct_desc', 'icon' => 'Star', 'criteria_type' => 'correct_count', 'criteria_value' => ['count' => 1], 'sort_order' => 1],
            ['slug' => 'correct_10', 'name_key' => 'badge.correct_10', 'description_key' => 'badge.correct_10_desc', 'icon' => 'Target', 'criteria_type' => 'correct_count', 'criteria_value' => ['count' => 10], 'sort_order' => 2],
            ['slug' => 'correct_50', 'name_key' => 'badge.correct_50', 'description_key' => 'badge.correct_50_desc', 'icon' => 'Zap', 'criteria_type' => 'correct_count', 'criteria_value' => ['count' => 50], 'sort_order' => 3],
            ['slug' => 'correct_100', 'name_key' => 'badge.correct_100', 'description_key' => 'badge.correct_100_desc', 'icon' => 'Trophy', 'criteria_type' => 'correct_count', 'criteria_value' => ['count' => 100], 'sort_order' => 4],
            ['slug' => 'streak_5', 'name_key' => 'badge.streak_5', 'description_key' => 'badge.streak_5_desc', 'icon' => 'Flame', 'criteria_type' => 'streak', 'criteria_value' => ['days' => 5], 'sort_order' => 5],
            ['slug' => 'streak_7', 'name_key' => 'badge.streak_7', 'description_key' => 'badge.streak_7_desc', 'icon' => 'Flame', 'criteria_type' => 'streak', 'criteria_value' => ['days' => 7], 'sort_order' => 6],
            ['slug' => 'streak_10', 'name_key' => 'badge.streak_10', 'description_key' => 'badge.streak_10_desc', 'icon' => 'Flame', 'criteria_type' => 'streak', 'criteria_value' => ['days' => 10], 'sort_order' => 7],
            ['slug' => 'lightning', 'name_key' => 'badge.lightning', 'description_key' => 'badge.lightning_desc', 'icon' => 'Bolt', 'criteria_type' => 'speed', 'criteria_value' => ['seconds' => 5], 'sort_order' => 8],
            ['slug' => 'combo_5', 'name_key' => 'badge.combo_5', 'description_key' => 'badge.combo_5_desc', 'icon' => 'Sparkles', 'criteria_type' => 'combo', 'criteria_value' => ['count' => 5], 'sort_order' => 9],
            ['slug' => 'think_explorer', 'name_key' => 'badge.think_explorer', 'description_key' => 'badge.think_explorer_desc', 'icon' => 'Brain', 'criteria_type' => 'think_solved', 'criteria_value' => ['count' => 1], 'sort_order' => 10],
            ['slug' => 'chatty', 'name_key' => 'badge.chatty', 'description_key' => 'badge.chatty_desc', 'icon' => 'MessageCircle', 'criteria_type' => 'chat_count', 'criteria_value' => ['count' => 5], 'sort_order' => 11],
            ['slug' => 'xp_500', 'name_key' => 'badge.xp_500', 'description_key' => 'badge.xp_500_desc', 'icon' => 'Medal', 'criteria_type' => 'total_xp', 'criteria_value' => ['xp' => 500], 'sort_order' => 12],
            ['slug' => 'xp_1500', 'name_key' => 'badge.xp_1500', 'description_key' => 'badge.xp_1500_desc', 'icon' => 'Medal', 'criteria_type' => 'total_xp', 'criteria_value' => ['xp' => 1500], 'sort_order' => 13],
            ['slug' => 'xp_3000', 'name_key' => 'badge.xp_3000', 'description_key' => 'badge.xp_3000_desc', 'icon' => 'Crown', 'criteria_type' => 'total_xp', 'criteria_value' => ['xp' => 3000], 'sort_order' => 14],
            ['slug' => 'correct_25', 'name_key' => 'badge.correct_25', 'description_key' => 'badge.correct_25_desc', 'icon' => 'Star', 'criteria_type' => 'correct_count', 'criteria_value' => ['count' => 25], 'sort_order' => 15],
            ['slug' => 'correct_200', 'name_key' => 'badge.correct_200', 'description_key' => 'badge.correct_200_desc', 'icon' => 'Target', 'criteria_type' => 'correct_count', 'criteria_value' => ['count' => 200], 'sort_order' => 16],
            ['slug' => 'correct_500', 'name_key' => 'badge.correct_500', 'description_key' => 'badge.correct_500_desc', 'icon' => 'Zap', 'criteria_type' => 'correct_count', 'criteria_value' => ['count' => 500], 'sort_order' => 17],
            ['slug' => 'streak_3', 'name_key' => 'badge.streak_3', 'description_key' => 'badge.streak_3_desc', 'icon' => 'Flame', 'criteria_type' => 'streak', 'criteria_value' => ['days' => 3], 'sort_order' => 18],
            ['slug' => 'streak_14', 'name_key' => 'badge.streak_14', 'description_key' => 'badge.streak_14_desc', 'icon' => 'Flame', 'criteria_type' => 'streak', 'criteria_value' => ['days' => 14], 'sort_order' => 19],
            ['slug' => 'streak_30', 'name_key' => 'badge.streak_30', 'description_key' => 'badge.streak_30_desc', 'icon' => 'Flame', 'criteria_type' => 'streak', 'criteria_value' => ['days' => 30], 'sort_order' => 20],
            ['slug' => 'combo_3', 'name_key' => 'badge.combo_3', 'description_key' => 'badge.combo_3_desc', 'icon' => 'Sparkles', 'criteria_type' => 'combo', 'criteria_value' => ['count' => 3], 'sort_order' => 21],
            ['slug' => 'addition_master', 'name_key' => 'badge.addition_master', 'description_key' => 'badge.addition_master_desc', 'icon' => 'Plus', 'criteria_type' => 'correct_by_type', 'criteria_value' => ['type' => 'addition', 'count' => 25], 'sort_order' => 22],
            ['slug' => 'subtraction_master', 'name_key' => 'badge.subtraction_master', 'description_key' => 'badge.subtraction_master_desc', 'icon' => 'Minus', 'criteria_type' => 'correct_by_type', 'criteria_value' => ['type' => 'subtraction', 'count' => 25], 'sort_order' => 23],
            ['slug' => 'multiplication_master', 'name_key' => 'badge.multiplication_master', 'description_key' => 'badge.multiplication_master_desc', 'icon' => 'X', 'criteria_type' => 'correct_by_type', 'criteria_value' => ['type' => 'multiplication', 'count' => 25], 'sort_order' => 24],
            ['slug' => 'division_master', 'name_key' => 'badge.division_master', 'description_key' => 'badge.division_master_desc', 'icon' => 'Divide', 'criteria_type' => 'correct_by_type', 'criteria_value' => ['type' => 'division', 'count' => 25], 'sort_order' => 25],
            ['slug' => 'chatty_10', 'name_key' => 'badge.chatty_10', 'description_key' => 'badge.chatty_10_desc', 'icon' => 'MessageCircle', 'criteria_type' => 'chat_count', 'criteria_value' => ['count' => 10], 'sort_order' => 26],
            ['slug' => 'chatty_20', 'name_key' => 'badge.chatty_20', 'description_key' => 'badge.chatty_20_desc', 'icon' => 'MessageCircle', 'criteria_type' => 'chat_count', 'criteria_value' => ['count' => 20], 'sort_order' => 27],
            ['slug' => 'think_5', 'name_key' => 'badge.think_5', 'description_key' => 'badge.think_5_desc', 'icon' => 'Brain', 'criteria_type' => 'think_solved', 'criteria_value' => ['count' => 5], 'sort_order' => 28],
            ['slug' => 'think_10', 'name_key' => 'badge.think_10', 'description_key' => 'badge.think_10_desc', 'icon' => 'Brain', 'criteria_type' => 'think_solved', 'criteria_value' => ['count' => 10], 'sort_order' => 29],
            ['slug' => 'xp_100', 'name_key' => 'badge.xp_100', 'description_key' => 'badge.xp_100_desc', 'icon' => 'Medal', 'criteria_type' => 'total_xp', 'criteria_value' => ['xp' => 100], 'sort_order' => 30],
            ['slug' => 'xp_1000', 'name_key' => 'badge.xp_1000', 'description_key' => 'badge.xp_1000_desc', 'icon' => 'Medal', 'criteria_type' => 'total_xp', 'criteria_value' => ['xp' => 1000], 'sort_order' => 31],
            ['slug' => 'xp_5000', 'name_key' => 'badge.xp_5000', 'description_key' => 'badge.xp_5000_desc', 'icon' => 'Award', 'criteria_type' => 'total_xp', 'criteria_value' => ['xp' => 5000], 'sort_order' => 32],
            ['slug' => 'speed_10', 'name_key' => 'badge.speed_10', 'description_key' => 'badge.speed_10_desc', 'icon' => 'Bolt', 'criteria_type' => 'speed', 'criteria_value' => ['seconds' => 10], 'sort_order' => 33],
            ['slug' => 'report_card_star', 'name_key' => 'badge.report_card_star', 'description_key' => 'badge.report_card_star_desc', 'icon' => 'Award', 'criteria_type' => 'report_suggestions_completed', 'criteria_value' => [], 'sort_order' => 34],
        ];

        foreach ($badges as $badge) {
            Badge::updateOrCreate(
                ['slug' => $badge['slug']],
                $badge
            );
        }
    }
}
