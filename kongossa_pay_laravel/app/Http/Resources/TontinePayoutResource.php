<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TontinePayoutResource extends JsonResource
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
            'amount' => $this->amount,
            'payout_date' => $this->payout_date->toDateString(),
            'payout_date_formatted' => $this->payout_date->format('M d, Y'),
            'status' => $this->status->value,
            'is_due' => $this->isDue(),
            'is_overdue' => $this->isOverdue(),
            'days_until_payout' => $this->payout_date->isFuture()
                ? now()->diffInDays($this->payout_date)
                : null,
            'days_overdue' => $this->payout_date->isPast() && $this->status->value === 'scheduled'
                ? $this->payout_date->diffInDays(now())
                : null,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),

            // Conditional relationships
            'tontine_member' => TontineMemberResource::make($this->whenLoaded('tontineMember')),
        ];
    }
}
