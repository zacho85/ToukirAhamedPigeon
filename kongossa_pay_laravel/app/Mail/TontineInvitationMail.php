<?php

namespace App\Mail;

use App\Models\Tontine;
use App\Models\TontineInvite;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class TontineInvitationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels, InteractsWithQueue;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public TontineInvite $invite,
        public Tontine $tontine,
        public User $inviter
    ) {
        //
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'You\'ve been invited to join ' . $this->invite->tontine->name,
            from: new Address(config('mail.from.address'), config('mail.from.name')),
            to: [
                new Address($this->invite->email, "New Tontine")
            ],
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.tontine-invitation',
            with: [
                'invite' => $this->invite,
                'acceptUrl' => route('invite.token', $this->invite->invite_token),
                'tontine' => $this->tontine,
                'inviter' => $this->inviter,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
