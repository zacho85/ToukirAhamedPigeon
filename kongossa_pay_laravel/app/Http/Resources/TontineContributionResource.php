<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TontineContributionResource extends JsonResource
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
            'contribution_date' => $this->contribution_date->toDateString(),
            'contribution_date_formatted' => $this->contribution_date->format('M d, Y'),
            'status' => $this->status->value,
            'is_overdue' => $this->isOverdue(),
            'days_since_due' => $this->contribution_date->isPast()
                ? $this->contribution_date->diffInDays(now())
                : null,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),

            // Conditional relationships
            'tontine_member' => TontineMemberResource::make($this->whenLoaded('tontineMember')),
        ];
    }
}
