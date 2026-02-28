<?php

namespace App\Listeners;

use App\Models\AiCall;
use Laravel\Ai\Events\AgentPrompted;
use Laravel\Ai\Responses\Data\Usage;

class LogAiCall
{
    /**
     * Handle the event.
     */
    public function handle(AgentPrompted $event): void
    {
        $response = $event->response;
        $usage = $response->usage ?? new Usage;
        $meta = $response->meta ?? null;

        $promptTokens = $usage->promptTokens ?? 0;
        $completionTokens = $usage->completionTokens ?? 0;
        $cacheWrite = $usage->cacheWriteInputTokens ?? 0;
        $cacheRead = $usage->cacheReadInputTokens ?? 0;
        $reasoning = $usage->reasoningTokens ?? 0;
        $totalTokens = $promptTokens + $completionTokens + $cacheWrite + $cacheRead + $reasoning;

        $promptText = $event->prompt->prompt ?? '';
        $callType = AiCall::inferCallType($promptText);

        AiCall::create([
            'user_id' => auth()->id(),
            'invocation_id' => $event->invocationId,
            'call_type' => $callType,
            'provider' => $meta?->provider,
            'model' => $meta?->model,
            'prompt_tokens' => $promptTokens,
            'completion_tokens' => $completionTokens,
            'cache_write_input_tokens' => $cacheWrite,
            'cache_read_input_tokens' => $cacheRead,
            'reasoning_tokens' => $reasoning,
            'total_tokens' => $totalTokens,
            'metadata' => [
                'agent' => $event->prompt->agent::class,
                'prompt_preview' => mb_substr($promptText, 0, 200),
            ],
        ]);
    }
}
