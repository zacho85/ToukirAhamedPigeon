<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TontineResource extends JsonResource
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
            'name' => $this->name,
            'type' => $this->type,
            'contribution_amount' => $this->contribution_amount,
            'frequency' => $this->frequency->value,
            'duration_months' => $this->duration_months,
            'is_active' => $this->isActive(),
            'total_collected' => $this->total_collected,
            'total_paid_out' => $this->total_paid_out,
            'expected_total' => $this->expected_total,
            'members_count' => $this->members()->count(),
            'pending_invites_count' => $this->invites()->where('status', 'pending')->count(),
            'next_payout_member' => TontineMemberResource::make($this->getNextPayoutMember()),
            'end_date' => $this->created_at->addMonths($this->duration_months)->toDateString(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'is_admin' => $this->isAdmin(auth()->user()),
            'status' => ucfirst($this->status->value),

            // Conditional relationships
            'creator' => UserResource::make($this->whenLoaded('creator')),
            'members' => TontineMemberResource::collection($this->whenLoaded('members')),
            'invites' => TontineInviteResource::collection($this->whenLoaded('invites')),
            'contributions' => TontineContributionResource::collection($this->whenLoaded('contributions')),
            'payouts' => TontinePayoutResource::collection($this->whenLoaded('payouts')),
        ];
    }
}
