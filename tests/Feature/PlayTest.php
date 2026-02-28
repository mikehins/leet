<?php

use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

use function Pest\Laravel\actingAs;
use function Pest\Laravel\post;

it('requires authentication to submit answer', function () {
    post(route('play.submit'), [
        'problem_id' => 1,
        'answer' => '5',
    ])->assertRedirect(route('login'));
});

it('submits answer and returns correct feedback', function () {
    $user = User::factory()->create();
    $problem = \App\Models\Problem::factory()->create([
        'correct_answer' => '42',
    ]);

    actingAs($user)
        ->post(route('play.submit'), [
            'problem_id' => $problem->id,
            'answer' => '42',
            'time_spent_seconds' => 10,
        ])
        ->assertOk()
        ->assertJson([
            'correct' => true,
            'correct_answer' => '42',
        ])
        ->assertJsonPath('points_earned', fn ($v) => $v > 0);
});

it('submits wrong answer and returns feedback', function () {
    $user = User::factory()->create();
    $problem = \App\Models\Problem::factory()->create([
        'correct_answer' => '42',
    ]);

    actingAs($user)
        ->post(route('play.submit'), [
            'problem_id' => $problem->id,
            'answer' => '99',
            'time_spent_seconds' => 5,
        ])
        ->assertOk()
        ->assertJson([
            'correct' => false,
            'correct_answer' => '42',
            'points_earned' => 0,
        ]);
});
