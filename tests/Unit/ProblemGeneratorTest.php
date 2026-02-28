<?php

use App\Enums\Difficulty;
use App\Enums\ProblemType;
use App\Services\ProblemGenerator;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

it('generates addition problems', function () {
    $generator = new ProblemGenerator;
    $problem = $generator->generate(ProblemType::Addition, Difficulty::Easy);

    expect($problem->type)->toBe(ProblemType::Addition)
        ->and($problem->difficulty)->toBe(Difficulty::Easy)
        ->and($problem->metadata)->toHaveKeys(['a', 'b'])
        ->and((int) $problem->correct_answer)->toBe($problem->metadata['a'] + $problem->metadata['b']);
});

it('generates subtraction problems with positive result', function () {
    $generator = new ProblemGenerator;
    $problem = $generator->generate(ProblemType::Subtraction, Difficulty::Easy);

    expect($problem->type)->toBe(ProblemType::Subtraction)
        ->and((int) $problem->correct_answer)->toBeGreaterThanOrEqual(0);
});

it('generates multiplication problems', function () {
    $generator = new ProblemGenerator;
    $problem = $generator->generate(ProblemType::Multiplication, Difficulty::Easy);

    expect($problem->type)->toBe(ProblemType::Multiplication)
        ->and((int) $problem->correct_answer)->toBe($problem->metadata['a'] * $problem->metadata['b']);
});

it('generates division problems with integer quotient', function () {
    $generator = new ProblemGenerator;
    $problem = $generator->generate(ProblemType::Division, Difficulty::Easy);

    expect($problem->type)->toBe(ProblemType::Division)
        ->and($problem->metadata['a'])->toBe($problem->metadata['b'] * (int) $problem->correct_answer);
});

it('generates random problems', function () {
    $generator = new ProblemGenerator;
    $problem = $generator->generateRandom(Difficulty::Easy);

    expect($problem)->toBeInstanceOf(\App\Models\Problem::class)
        ->and($problem->correct_answer)->not->toBeEmpty();
});
