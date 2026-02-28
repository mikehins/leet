<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('competitive_game_players', function (Blueprint $table) {
            $table->string('grade', 20)->default('grade_4')->after('score');
        });

        Schema::table('competitive_game_rounds', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('competitive_game_id')->constrained()->cascadeOnDelete();
        });

        // Backfill: existing rounds get duplicated per player (both get same problem - legacy behavior)
        $rounds = DB::table('competitive_game_rounds')->whereNull('user_id')->get();
        foreach ($rounds as $round) {
            $playerIds = DB::table('competitive_game_players')
                ->where('competitive_game_id', $round->competitive_game_id)
                ->pluck('user_id');
            foreach ($playerIds as $userId) {
                DB::table('competitive_game_rounds')->insert([
                    'competitive_game_id' => $round->competitive_game_id,
                    'user_id' => $userId,
                    'problem_id' => $round->problem_id,
                    'round_number' => $round->round_number,
                    'created_at' => $round->created_at,
                    'updated_at' => $round->updated_at,
                ]);
            }
        }
        DB::table('competitive_game_rounds')->whereNull('user_id')->delete();

        Schema::table('competitive_game_rounds', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable(false)->change();
            $table->unique(['competitive_game_id', 'round_number', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::table('competitive_game_rounds', function (Blueprint $table) {
            $table->dropUnique(['competitive_game_id', 'round_number', 'user_id']);
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });

        Schema::table('competitive_game_players', function (Blueprint $table) {
            $table->dropColumn('grade');
        });
    }
};
