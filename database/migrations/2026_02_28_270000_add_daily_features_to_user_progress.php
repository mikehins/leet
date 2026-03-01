<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_progress', function (Blueprint $table) {
            $table->unsignedInteger('login_streak')->default(0)->after('longest_streak');
            $table->date('last_login_date')->nullable()->after('login_streak');
            $table->date('daily_quest_completed_at')->nullable()->after('last_login_date');
        });
    }

    public function down(): void
    {
        Schema::table('user_progress', function (Blueprint $table) {
            $table->dropColumn(['login_streak', 'last_login_date', 'daily_quest_completed_at']);
        });
    }
};
