<?php

namespace App\Services;

use App\Http\Resources\BudgetResource;
use App\Models\Budget;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Pagination\LengthAwarePaginator;

class BudgetService
{
    /**
     * Get paginated budgets for a user with optional filters.
     */
    public function getUserBudgets(User $user, Request $request): AnonymousResourceCollection
    {
        $budgets = Budget::where('user_id', $user->id)
            ->when($request->period, function ($query, $period) {
                return $query->where('period', $period);
            })
            ->when($request->search, function ($query, $search) {
                return $query->where('name', 'like', "%{$search}%");
            })
            ->when($request->with_categories, function ($query) {
                return $query->with(['budgetCategories', 'expenses']);
            })
            ->orderBy($request->sort_by ?? 'created_at', $request->sort_direction ?? 'desc')
            ->paginate($request->per_page ?? 15);

        return BudgetResource::collection($budgets);
    }

    /**
     * Create a new budget for a user.
     */
    public function createBudget(User $user, array $data): BudgetResource
    {
        $budget = Budget::create([
            'user_id' => $user->id,
            'name' => $data['name'],
            'period' => $data['period'],
            'total_amount' => $data['total_amount'],
        ]);

        return new BudgetResource($budget);
    }

    /**
     * Get a budget with its relationships.
     */
    public function getBudgetWithRelations(Budget $budget): BudgetResource
    {
        $budget->load(['budgetCategories.expenses', 'expenses']);
        return new BudgetResource($budget);
    }

    /**
     * Update a budget with validated data.
     */
    public function updateBudget(Budget $budget, array $data): BudgetResource
    {
        $budget->update($data);
        return new BudgetResource($budget);
    }

    /**
     * Delete a budget.
     */
    public function deleteBudget(Budget $budget): JsonResponse
    {
        $budget->delete();
        return response()->json(['message' => 'Budget deleted successfully']);
    }

    /**
     * Get budget statistics for a user.
     */
    public function getBudgetStats(User $user, ?string $period = null): JsonResponse
    {
        $budgets = Budget::where('user_id', $user->id)
            ->when($period, function ($query, $period) {
                return $query->where('period', $period);
            })
            ->get();

        $stats = [
            'total_budgets' => $budgets->count(),
            'total_budget_amount' => $budgets->sum('total_amount'),
            'total_spent' => $budgets->sum(function ($budget) {
                return $budget->total_spent;
            }),
            'over_budget_count' => $budgets->filter(function ($budget) {
                return $budget->isOverBudget();
            })->count(),
            'avg_usage_percentage' => $budgets->avg(function ($budget) {
                return $budget->total_amount > 0
                    ? ($budget->total_spent / $budget->total_amount) * 100
                    : 0;
            }),
        ];

        return response()->json($stats);
    }

    /**
     * Get budget summary for dashboard.
     */
    public function getBudgetSummary(User $user, string $period = 'monthly'): JsonResponse
    {
        $budgets = Budget::where('user_id', $user->id)
            ->where('period', $period)
            ->with(['budgetCategories.expenses'])
            ->get();

        $summary = [
            'period' => $period,
            'total_budgets' => $budgets->count(),
            'total_allocated' => $budgets->sum('total_amount'),
            'total_spent' => $budgets->sum(function ($budget) {
                return $budget->total_spent;
            }),
            'budgets' => BudgetResource::collection($budgets),
        ];

        return response()->json($summary);
    }
}
