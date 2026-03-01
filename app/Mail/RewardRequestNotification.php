<?php

namespace App\Mail;

use App\Models\RewardRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RewardRequestNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public RewardRequest $rewardRequest
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: __('rewards.parent_email_subject', ['name' => $this->rewardRequest->user->name]),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.reward-request-notification',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
