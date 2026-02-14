<?php

namespace App\Services;

use App\Http\Resources\ExpenseResource;
use App\Models\BudgetCategory;
use App\Models\Expense;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Pagination\LengthAwarePaginator;

class ExpenseService
{
    /**
     * Get paginated expenses for a budget category.
     */
    public function getCategoryExpenses(BudgetCategory $category, Request $request): AnonymousResourceCollection
    {
        $expenses = $category->expenses()
            ->when($request->search, function ($query, $search) {
                return $query->where('title', 'like', "%{$search}%");
            })
            ->when($request->start_date && $request->end_date, function ($query) use ($request) {
                return $query->whereBetween('expense_date', [$request->start_date, $request->end_date]);
            })
            ->when($request->min_amount, function ($query, $amount) {
                return $query->where('amount', '>=', $amount);
            })
            ->when($request->max_amount, function ($query, $amount) {
                return $query->where('amount', '<=', $amount);
            })
            ->orderBy($request->sort_by ?? 'expense_date', $request->sort_direction ?? 'desc')
            ->paginate($request->per_page ?? 15);

        return ExpenseResource::collection($expenses);
    }

    /**
     * Create a new expense for a budget category.
     */
    public function createExpense(array $data): ExpenseResource
    {
        $expense = Expense::create($data);
        return new ExpenseResource($expense->load('budgetCategory'));
    }

    /**
     * Get an expense with its relationships.
     */
    public function getExpenseWithRelations(Expense $expense): ExpenseResource
    {
        $expense->load('budgetCategory.budget');
        return new ExpenseResource($expense);
    }

    /**
     * Update an expense.
     */
    public function updateExpense(Expense $expense, array $data): ExpenseResource
    {
        $expense->update($data);
        return new ExpenseResource($expense->load('budgetCategory'));
    }

    /**
     * Delete an expense.
     */
    public function deleteExpense(Expense $expense): JsonResponse
    {
        $expense->delete();
        return response()->json(['message' => 'Expense deleted successfully']);
    }

    /**
     * Get all expenses for a user across all budgets.
     */
    public function getUserExpenses(User $user, Request $request): AnonymousResourceCollection
    {
        $expenses = Expense::whereHas('budgetCategory.budget', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
            ->when($request->search, function ($query, $search) {
                return $query->where('title', 'like', "%{$search}%");
            })
            ->when($request->category_id, function ($query, $categoryId) {
                return $query->where('budget_category_id', $categoryId);
            })
            ->when($request->start_date && $request->end_date, function ($query) use ($request) {
                return $query->whereBetween('expense_date', [$request->start_date, $request->end_date]);
            })
            ->with('budgetCategory.budget')
            ->orderBy($request->sort_by ?? 'expense_date', $request->sort_direction ?? 'desc')
            ->get();

        return ExpenseResource::collection($expenses);
    }

    /**
     * Get expense statistics for a user.
     */
    public function getUserExpenseStats(User $user, ?string $startDate = null, ?string $endDate = null): JsonResponse
    {
        $startDate = $startDate ?? now()->startOfMonth();
        $endDate = $endDate ?? now()->endOfMonth();

        $expenses = Expense::whereHas('budgetCategory.budget', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
            ->whereBetween('expense_date', [$startDate, $endDate])
            ->get();

        $stats = [
            'period' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
            'total_expenses' => $expenses->count(),
            'total_amount' => $expenses->sum('amount'),
            'average_expense' => $expenses->avg('amount'),
            'largest_expense' => $expenses->max('amount'),
            'smallest_expense' => $expenses->min('amount'),
            'expenses_by_category' => $expenses->groupBy('budget_category_id')
                ->map(function ($categoryExpenses) {
                    return [
                        'category' => $categoryExpenses->first()->budgetCategory->name,
                        'count' => $categoryExpenses->count(),
                        'total' => $categoryExpenses->sum('amount'),
                    ];
                })->values(),
        ];

        return response()->json($stats);
    }
}
