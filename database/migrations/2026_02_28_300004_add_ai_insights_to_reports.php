<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ai_student_reports', function (Blueprint $table) {
            $table->json('recommendations')->nullable()->after('areas_to_improve');
            $table->json('ai_insights')->nullable()->after('recommendations');
        });
    }

    public function down(): void
    {
        Schema::table('ai_student_reports', function (Blueprint $table) {
            $table->dropColumn(['recommendations', 'ai_insights']);
        });
    }
};
