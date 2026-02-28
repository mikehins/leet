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
        Schema::table('user_progress', function (Blueprint $table) {
            $table->unsignedInteger('chat_questions_count')->default(0)->after('longest_streak');
        });
    }

    public function down(): void
    {
        Schema::table('user_progress', function (Blueprint $table) {
            $table->dropColumn('chat_questions_count');
        });
    }
};
