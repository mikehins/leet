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
        Schema::create('ai_calls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('invocation_id', 36)->index();
            $table->string('call_type', 50)->nullable()->index();
            $table->string('provider')->nullable();
            $table->string('model')->nullable();
            $table->unsignedInteger('prompt_tokens')->default(0);
            $table->unsignedInteger('completion_tokens')->default(0);
            $table->unsignedInteger('cache_write_input_tokens')->default(0);
            $table->unsignedInteger('cache_read_input_tokens')->default(0);
            $table->unsignedInteger('reasoning_tokens')->default(0);
            $table->unsignedInteger('total_tokens')->default(0);
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['created_at']);
            $table->index(['provider', 'model']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_calls');
    }
};
