<?php

namespace App\Http\Controllers;

use App\Http\Requests\Expense\StoreExpenseRequest;
use App\Http\Requests\Expense\UpdateExpenseRequest;
use App\Http\Resources\BudgetCategoryResource;
use App\Models\BudgetCategory;
use App\Models\Expense;
use App\Services\ExpenseService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    public function __construct(private ExpenseService $expenseService)
    {
        //
    }

    /**
     * Display a listing of all user expenses.
     */
    public function index(Request $request)
    {
        return Inertia::render('expenses/ExpensesList', [
            'expenses' => $this->expenseService->getUserExpenses(auth()->user(), $request),
            'budgetCategories' => BudgetCategoryResource::collection(BudgetCategory::get()),
        ]);
    }

    /**
     * Show the form for creating a new expense.
     */
    public function create()
    {
        $budgetCategories = auth()->user()->budgets()
            ->with('budgetCategories')
            ->get()
            ->pluck('budgetCategories')
            ->flatten();

        return Inertia::render('expenses/CreateExpense', [
            'budgetCategories' => $budgetCategories,
        ]);
    }

    /**
     * Store a newly created expense in storage.
     */
    public function store(StoreExpenseRequest $request)
    {
        $this->expenseService->createExpense($request->validated());

        return redirect()->route('expenses.index')
            ->with('success', 'Expense added successfully.');
    }

    /**
     * Display the specified expense.
     */
    public function show(Expense $expense)
    {
        $this->authorize('view', $expense->budgetCategory->budget);
        $expenseData = $this->expenseService->getExpenseWithRelations($expense);

        return Inertia::render('expenses/ExpenseDetail', [
            'expense' => $expenseData->getData(),
        ]);
    }

    /**
     * Show the form for editing the specified expense.
     */
    public function edit(Expense $expense)
    {
        $this->authorize('update', $expense->budgetCategory->budget);

        $budgetCategories = auth()->user()->budgets()
            ->with('budgetCategories')
            ->get()
            ->pluck('budgetCategories')
            ->flatten();

        return Inertia::render('expenses/EditExpense', [
            'expense' => $expense->load('budgetCategory'),
            'budgetCategories' => $budgetCategories,
        ]);
    }

    /**
     * Update the specified expense in storage.
     */
    public function update(UpdateExpenseRequest $request, Expense $expense)
    {
        $this->authorize('update', $expense->budgetCategory->budget);
        $this->expenseService->updateExpense($expense, $request->validated());

        return redirect()->route('expenses.show', $expense)
            ->with('success', 'Expense updated successfully.');
    }

    /**
     * Remove the specified expense from storage.
     */
    public function destroy(Expense $expense)
    {
        $this->authorize('delete', $expense->budgetCategory->budget);
        $this->expenseService->deleteExpense($expense);

        return redirect()->route('expenses.index')
            ->with('success', 'Expense deleted successfully.');
    }

    /**
     * Get user's all expenses across all budgets.
     */
    public function userExpenses(Request $request)
    {
        return $this->expenseService->getUserExpenses(auth()->user(), $request);
    }

    /**
     * Get expense statistics for a user.
     */
    public function stats(Request $request)
    {
        return $this->expenseService->getUserExpenseStats(
            auth()->user(),
            $request->start_date,
            $request->end_date
        );
    }
}
