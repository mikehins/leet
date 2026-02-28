<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WordProblemGenerated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $token,
        public array $problem
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('think.' . $this->token),
        ];
    }

    public function broadcastAs(): string
    {
        return 'problem.ready';
    }

    public function broadcastWith(): array
    {
        return [
            'problem' => $this->problem,
        ];
    }
}
