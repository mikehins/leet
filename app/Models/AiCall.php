<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiCall extends Model
{
    protected $fillable = [
        'user_id',
        'invocation_id',
        'call_type',
        'provider',
        'model',
        'prompt_tokens',
        'completion_tokens',
        'cache_write_input_tokens',
        'cache_read_input_tokens',
        'reasoning_tokens',
        'total_tokens',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Infer call type from prompt text for stats grouping.
     */
    public static function inferCallType(string $prompt): ?string
    {
        if (str_contains($prompt, 'Create a word problem')) {
            return 'word_problem';
        }
        if (str_contains($prompt, 'Give ONE fun, simple hint')) {
            return 'hint';
        }
        if (str_contains($prompt, 'Explain why the answer is')) {
            return 'explain_answer';
        }
        if (str_contains($prompt, 'Conversation so far') || str_contains($prompt, 'Respond as the tutor')) {
            return 'chat';
        }

        return 'other';
    }
}
