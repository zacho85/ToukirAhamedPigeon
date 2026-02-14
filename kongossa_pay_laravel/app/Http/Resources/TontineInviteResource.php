<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TontineInviteResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'status' => $this->status->value,
            'is_expired' => $this->isExpired(),
            'invite_url' => $this->invite_url,
            'days_since_sent' => $this->created_at->diffInDays(now()),
            'expires_at' => $this->created_at->addDays(7)->toISOString(),
            'invited_user' => $this->invited_user ? UserResource::make($this->invited_user) : null,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),

            // Conditional relationships
            'tontine' => TontineResource::make($this->whenLoaded('tontine')),
        ];
    }
}
