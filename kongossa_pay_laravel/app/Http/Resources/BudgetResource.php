<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BudgetResource extends JsonResource
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
            'period' => $this->period->value,
            'total_amount' => $this->total_amount,
            'total_spent' => $this->total_spent,
            'remaining_amount' => $this->remaining_amount,
            'is_over_budget' => $this->isOverBudget(),
            'usage_percentage' => $this->total_amount > 0
                ? round(($this->total_spent / $this->total_amount) * 100, 2)
                : 0,
            'categories_count' => $this->budgetCategories()->count(),
            'expenses_count' => $this->expenses()->count(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),

            // Conditional relationships
            'user' => UserResource::make($this->whenLoaded('user')),
            'categories' => BudgetCategoryResource::collection($this->whenLoaded('budgetCategories')),
            'expenses' => ExpenseResource::collection($this->whenLoaded('expenses')),
        ];
    }
}
