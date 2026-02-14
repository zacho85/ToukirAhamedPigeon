<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TontineMemberResource extends JsonResource
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
            'priority_order' => $this->priority_order,
            'is_admin' => $this->is_admin,
            'total_contributed' => $this->total_contributed,
            'total_received' => $this->total_received,
            'has_pending_contributions' => $this->hasPendingContributions(),
            'has_received_payout' => $this->hasReceivedPayout(),
            'current_period_status' => $this->getCurrentPeriodStatus(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),

            // Conditional relationships
            'user' => UserResource::make($this->whenLoaded('user')),
            'tontine' => TontineResource::make($this->whenLoaded('tontine')),
            'contributions' => TontineContributionResource::collection($this->whenLoaded('contributions')),
            'payouts' => TontinePayoutResource::collection($this->whenLoaded('payouts')),
        ];
    }
}
