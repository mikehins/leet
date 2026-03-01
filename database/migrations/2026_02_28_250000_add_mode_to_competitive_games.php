<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('competitive_games', function (Blueprint $table) {
            $table->string('mode')->default('regular')->after('status');
            $table->unsignedSmallInteger('time_limit_seconds')->nullable()->after('mode');
        });
    }

    public function down(): void
    {
        Schema::table('competitive_games', function (Blueprint $table) {
            $table->dropColumn(['mode', 'time_limit_seconds']);
        });
    }
};
