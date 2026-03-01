<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reward_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('points_spent');
            $table->decimal('dollars_value', 8, 2);
            $table->string('status')->default('pending'); // pending, approved, fulfilled, cancelled
            $table->text('message')->nullable();
            $table->string('reward_tier')->nullable(); // e.g. $5, $10, $25
            $table->timestamp('parent_notified_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reward_requests');
    }
};
