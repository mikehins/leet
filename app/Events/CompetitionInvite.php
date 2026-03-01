<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CompetitionInvite implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $creatorName,
        public int $creatorId,
        public string $code
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PresenceChannel('competitions'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'competition.invite';
    }
}
