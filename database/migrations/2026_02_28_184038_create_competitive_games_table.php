<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('competitive_games', function (Blueprint $table) {
            $table->id();
            $table->string('code', 6)->unique();
            $table->string('status')->default('waiting'); // waiting, active, finished
            $table->string('difficulty')->default('easy');
            $table->unsignedTinyInteger('total_rounds')->default(5);
            $table->unsignedTinyInteger('current_round')->default(0);
            $table->foreignId('current_problem_id')->nullable()->constrained('problems')->nullOnDelete();
            $table->timestamp('round_ends_at')->nullable();
            $table->timestamps();
        });

        Schema::create('competitive_game_players', function (Blueprint $table) {
            $table->id();
            $table->foreignId('competitive_game_id')->constrained('competitive_games')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('score')->default(0);
            $table->timestamps();

            $table->unique(['competitive_game_id', 'user_id']);
        });

        Schema::create('competitive_game_rounds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('competitive_game_id')->constrained('competitive_games')->cascadeOnDelete();
            $table->foreignId('problem_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('round_number');
            $table->timestamps();
        });

        Schema::create('competitive_game_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('competitive_game_id')->constrained('competitive_games')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('problem_id')->constrained()->cascadeOnDelete();
            $table->string('answer');
            $table->boolean('correct');
            $table->unsignedInteger('time_spent_seconds')->default(0);
            $table->timestamps();

            $table->unique(['competitive_game_id', 'user_id', 'problem_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('competitive_game_answers');
        Schema::dropIfExists('competitive_game_rounds');
        Schema::dropIfExists('competitive_game_players');
        Schema::dropIfExists('competitive_games');
    }
};
