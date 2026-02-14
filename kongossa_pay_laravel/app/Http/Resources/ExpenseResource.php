<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExpenseResource extends JsonResource
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
            'title' => $this->title,
            'amount' => $this->amount,
            'expense_date' => $this->expense_date->toDateString(),
            'expense_date_formatted' => $this->expense_date->format('M d, Y'),
            'days_ago' => $this->expense_date->diffForHumans(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),

            // Conditional relationships
            'budget_category' => BudgetCategoryResource::make($this->whenLoaded('budgetCategory')),
        ];
    }
}
