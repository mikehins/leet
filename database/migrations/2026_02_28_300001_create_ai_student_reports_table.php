<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_student_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('period_start');
            $table->date('period_end');
            $table->text('summary');
            $table->json('suggested_topics')->nullable(); // e.g. ['division', 'multiplication']
            $table->json('strengths')->nullable();
            $table->json('areas_to_improve')->nullable();
            $table->unsignedInteger('suggested_count')->default(5); // problems to complete per topic
            $table->timestamps();

            $table->index(['user_id', 'period_end']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_student_reports');
    }
};
