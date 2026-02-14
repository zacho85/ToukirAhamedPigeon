<?php

namespace App\Services;

use App\Http\Resources\BudgetCategoryResource;
use App\Models\Budget;
use App\Models\BudgetCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Pagination\LengthAwarePaginator;

class BudgetCategoryService
{
    /**
     * Get paginated categories for a budget.
     */
    public function getBudgetCategories(Budget $budget, Request $request): AnonymousResourceCollection
    {
        $categories = $budget->budgetCategories()
            ->when($request->search, function ($query, $search) {
                return $query->where('name', 'like', "%{$search}%");
            })
            ->when($request->with_expenses, function ($query) {
                return $query->with('expenses');
            })
            ->orderBy($request->sort_by ?? 'created_at', $request->sort_direction ?? 'desc')
            ->paginate($request->per_page ?? 15);

        return BudgetCategoryResource::collection($categories);
    }

    /**
     * Create a new budget category.
     */
    public function createBudgetCategory(array $data): BudgetCategoryResource
    {
        $category = BudgetCategory::create($data);
        return new BudgetCategoryResource($category);
    }

    /**
     * Get a budget category with its relationships.
     */
    public function getBudgetCategoryWithRelations(BudgetCategory $category): BudgetCategoryResource
    {
        $category->load(['budget', 'expenses']);
        return new BudgetCategoryResource($category);
    }

    /**
     * Update a budget category.
     */
    public function updateBudgetCategory(BudgetCategory $category, array $data): BudgetCategoryResource
    {
        $category->update($data);
        return new BudgetCategoryResource($category);
    }

    /**
     * Delete a budget category.
     */
    public function deleteBudgetCategory(BudgetCategory $category): JsonResponse
    {
        $category->delete();
        return response()->json(['message' => 'Budget category deleted successfully']);
    }

    /**
     * Get budget category statistics.
     */
    public function getBudgetCategoryStats(BudgetCategory $category): JsonResponse
    {
        $stats = [
            'total_expenses' => $category->expenses()->count(),
            'total_spent' => $category->total_spent,
            'remaining_amount' => $category->remaining_amount,
            'usage_percentage' => $category->usage_percentage,
            'is_over_limit' => $category->isOverLimit(),
            'recent_expenses' => $category->expenses()
                ->orderBy('expense_date', 'desc')
                ->limit(5)
                ->get(),
        ];

        return response()->json($stats);
    }
}
