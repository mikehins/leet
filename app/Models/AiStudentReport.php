<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AiStudentReport extends Model
{
    protected $table = 'ai_student_reports';

    protected $fillable = [
        'user_id',
        'period_start',
        'period_end',
        'summary',
        'suggested_topics',
        'strengths',
        'areas_to_improve',
        'recommendations',
        'ai_insights',
        'suggested_count',
    ];

    protected function casts(): array
    {
        return [
            'period_start' => 'date',
            'period_end' => 'date',
            'suggested_topics' => 'array',
            'strengths' => 'array',
            'areas_to_improve' => 'array',
            'recommendations' => 'array',
            'ai_insights' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function suggestedProgress(): HasMany
    {
        return $this->hasMany(ReportSuggestedProgress::class, 'ai_student_report_id');
    }

    public function isFullyCompleted(): bool
    {
        return $this->suggestedProgress()
            ->where('target_count', '>', 0)
            ->get()
            ->every(fn ($p) => $p->correct_count >= $p->target_count);
    }
}
