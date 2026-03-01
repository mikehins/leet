<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class FriendActivityMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $child,
        public string $activityType,
        public string $otherUserName,
    ) {}

    public function envelope(): Envelope
    {
        $subjectKey = "friends.parent_email_subject_{$this->activityType}";

        return new Envelope(
            subject: __($subjectKey, [
                'child' => $this->child->name,
                'other' => $this->otherUserName,
            ]),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.friend-activity',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
