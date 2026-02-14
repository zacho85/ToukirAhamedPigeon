<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BudgetCategoryResource extends JsonResource
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
            'color' => $this->color,
            'limit_amount' => $this->limit_amount,
            'total_spent' => $this->total_spent,
            'description' => $this->description,
            'remaining_amount' => $this->remaining_amount,
            'is_over_limit' => $this->isOverLimit(),
            'usage_percentage' => $this->usage_percentage,
            'expenses_count' => $this->expenses()->count(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),

            // Conditional relationships
            'budget' => BudgetResource::make($this->whenLoaded('budget')),
            'expenses' => ExpenseResource::collection($this->whenLoaded('expenses')),
        ];
    }
}
