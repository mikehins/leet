<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportSuggestedProgress extends Model
{
    protected $table = 'report_suggested_progress';

    protected $fillable = [
        'user_id',
        'ai_student_report_id',
        'topic',
        'correct_count',
        'target_count',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function report(): BelongsTo
    {
        return $this->belongsTo(AiStudentReport::class, 'ai_student_report_id');
    }

    public function isCompleted(): bool
    {
        return $this->correct_count >= $this->target_count;
    }
}
