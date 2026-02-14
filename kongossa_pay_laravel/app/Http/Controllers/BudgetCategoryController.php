<?php

namespace App\Http\Controllers;

use App\Http\Requests\BudgetCategory\StoreBudgetCategoryRequest;
use App\Http\Requests\BudgetCategory\UpdateBudgetCategoryRequest;
use App\Http\Resources\BudgetCategoryResource;
use App\Models\Budget;
use App\Models\BudgetCategory;
use App\Services\BudgetCategoryService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BudgetCategoryController extends Controller
{
    public function __construct(private BudgetCategoryService $budgetCategoryService)
    {
        //Hello World
    }

    /**
     * Display a listing of all budget categories for the user.
     */
    public function index(Request $request)
    {
        return Inertia::render('budget-categories/CategoriesList', [
            'categories' => BudgetCategoryResource::collection(
                BudgetCategory::query()->get()
            ),
        ]);
    }

    /**
     * Show the form for creating a new category.
     */
    public function create()
    {
        $budgets = auth()->user()->budgets()->get();
        return Inertia::render('budget-categories/CreateCategory', [
            'budgets' => $budgets,
        ]);
    }

    /**
     * Store a newly created category in storage.
     */
    public function store(StoreBudgetCategoryRequest $request)
    {
        $this->budgetCategoryService->createBudgetCategory($request->validated());

        return redirect()->route('budget-categories.index')
            ->with('success', 'Budget category created successfully.');
    }

    /**
     * Display the specified category.
     */
    public function show(BudgetCategory $budgetCategory)
    {
        return Inertia::render('budget-categories/CategoryDetail', [
            'category' => $this->budgetCategoryService->getBudgetCategoryWithRelations($budgetCategory),
        ]);
    }

    /**
     * Show the form for editing the specified category.
     */
    public function edit(BudgetCategory $budgetCategory)
    {
        $this->authorize('update', $budgetCategory->budget);
        return Inertia::render('budget-categories/EditCategories', [
            'category' => $budgetCategory->load('budget'),
        ]);
    }

    /**
     * Update the specified category in storage.
     */
    public function update(UpdateBudgetCategoryRequest $request, BudgetCategory $budgetCategory)
    {
        $this->budgetCategoryService->updateBudgetCategory($budgetCategory, $request->validated());

        return redirect()->route('budget-categories.index')
            ->with('success', 'Budget category updated successfully.');
    }

    /**
     * Remove the specified category from storage.
     */
    public function destroy(BudgetCategory $budgetCategory)
    {
        $this->budgetCategoryService->deleteBudgetCategory($budgetCategory);

        return redirect()->route('budgets.index')
            ->with('success', 'Budget category deleted successfully.');
    }

    /**
     * Get category statistics.
     */
    public function stats(BudgetCategory $budgetCategory)
    {
        $this->authorize('view', $budgetCategory->budget);

        return $this->budgetCategoryService->getBudgetCategoryStats($budgetCategory);
    }
}



