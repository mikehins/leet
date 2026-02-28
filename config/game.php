<?php

return [
    'name' => 'Math & Reading Quest',
    'version' => '1.0.0',
    'target_age' => '8-12',
    'description' => 'LeetCode-inspired platform with short, gamified math and reading puzzles for children.',
    'subjects' => ['math', 'reading'],
    'default_language' => 'en',
    'privacy_level' => 'COPPA-compliant',

    'reward_tiers' => [
        'bronze' => ['xp' => 500, 'badge' => 'beginner-explorer'],
        'silver' => ['xp' => 1500, 'badge' => 'math-reader-star'],
        'gold' => ['xp' => 3000, 'badge' => 'legend-quest'],
    ],

    'stars' => [
        'perfect' => 3,
        'good' => 2,
        'ok' => 1,
    ],

    'xp_per_correct' => 50,
    'xp_per_chat_response' => 5,
    'xp_speed_bonus' => [
        'under_5_sec' => 25,
        'under_10_sec' => 10,
    ],
    'xp_combo_bonus' => [
        2 => 5,
        3 => 10,
        4 => 15,
        5 => 25,
    ],

    'rewards' => [
        'correct_animations' => [
            ['type' => 'confetti-explosion', 'duration' => 2.5, 'sound' => null],
            ['type' => 'sparkling-stars', 'duration' => 2.0, 'sound' => null],
            ['type' => 'trophy-spin', 'duration' => 1.5, 'sound' => null],
            ['type' => 'fireworks-mini', 'duration' => 2.0, 'sound' => null],
            ['type' => 'rainbow-swipe', 'duration' => 1.8, 'sound' => null],
            // Add sound paths when ready, e.g. 'sound' => '/sounds/cheer-short.mp3'
        ],
    ],
];
