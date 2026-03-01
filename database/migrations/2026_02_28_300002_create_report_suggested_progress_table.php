<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('report_suggested_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('ai_student_report_id')->constrained('ai_student_reports')->cascadeOnDelete();
            $table->string('topic'); // addition, subtraction, multiplication, division
            $table->unsignedInteger('correct_count')->default(0);
            $table->unsignedInteger('target_count')->default(5);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'ai_student_report_id', 'topic']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('report_suggested_progress');
    }
};
