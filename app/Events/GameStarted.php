<?php

namespace App\Events;

use App\Models\CompetitiveGame;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GameStarted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public CompetitiveGame $game,
        public array $players,
        public array $problems
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('game.' . $this->game->code),
        ];
    }

    public function broadcastAs(): string
    {
        return 'game.started';
    }
}
