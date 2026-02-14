<?php

namespace App\Http\Controllers;

use App\Http\Requests\Budget\StoreBudgetRequest;
use App\Http\Requests\Budget\UpdateBudgetRequest;
use App\Models\Budget;
use App\Models\Expense;
use App\Models\TontineInvite;
use App\Services\BudgetService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BudgetController extends Controller
{
    public function __construct(private BudgetService $budgetService)
    {
        //
    }

    /**
     * Dashboard page with overview stats
     */
    public function dashboard()
    {
        $user = auth()->user();

        // Budget stats
        $budgets = $user->budgets()->with('budgetCategories.expenses')->get();
        $totalAllocated = $budgets->sum('total_amount');
        $totalSpent = $budgets->pluck('budgetCategories')->flatten()->pluck('expenses')->flatten()->sum('amount');
        $overBudgetCount = $budgets->filter(function ($budget) {
            return $budget->budgetCategories->pluck('expenses')->flatten()->sum('amount') > $budget->total_amount;
        })->count();

        // Tontine stats
        $tontineMemberships = $user->tontineMembers()->with(['contributions', 'payouts', 'tontine'])->get();
        $totalContributed = $tontineMemberships->pluck('contributions')->flatten()->sum('amount');
        $totalReceived = $tontineMemberships->pluck('payouts')->flatten()->sum('amount');
        $pendingInvites = TontineInvite::select()->where('status', 'pending')->count();

        // Recent expenses
        $recentExpenses = Expense::select()
            // ->where('user_id', $user->id)
            ->latest()
            ->take(5)
            ->with('budgetCategory')
            ->get()
            ->map(function ($expense) {
                return [
                    'id' => $expense->id,
                    'title' => $expense->title,
                    'amount' => $expense->amount,
                    'category' => $expense->budgetCategory->name,
                    'date' => $expense->expense_date,
                ];
            });

        // Upcoming payouts
        $upcomingPayouts = $tontineMemberships->map(function ($member) {
            $tontine = $member->tontine;
            $startDate = Carbon::parse($tontine->start_date);
            $rounds = $member->priority_order - 1;

            // Calculate payout date based on frequency
            $payoutDate = match ($tontine->frequency->value) {
                'daily' => $startDate->copy()->addDays($rounds),
                'weekly' => $startDate->copy()->addWeeks($rounds),
                'monthly' => $startDate->copy()->addMonths($rounds),
                default => $startDate->copy()->addMonths($rounds),
            };

            if ($payoutDate->isFuture()) {
                return [
                    'id' => $member->id,
                    'tontine_name' => $tontine->name,
                    'payout_date' => $payoutDate->toDateString(),
                    'amount' => $tontine->contribution_amount * $tontine->members()->count(),
                ];
            }
            return null;
        })->filter()->sortBy('payout_date')->take(5)->values();


        $stats = [
            'budgets' => [
                'total' => $budgets->count(),
                'active' => $budgets->count(), // Assuming all are active
                'totalAllocated' => $totalAllocated,
                'totalSpent' => $totalSpent,
                'overBudgetCount' => $overBudgetCount,
            ],
            'tontines' => [
                'total' => $tontineMemberships->count(),
                'active' => $tontineMemberships->count(), // Assuming all are active
                'totalContributed' => $totalContributed,
                'totalReceived' => $totalReceived,
                'pendingInvites' => $pendingInvites,
            ],
            'recentExpenses' => $recentExpenses,
            'upcomingPayouts' => $upcomingPayouts,
        ];

        return Inertia::render('Dashboard', compact('stats'));
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $budgets = $this->budgetService->getUserBudgets(auth()->user(), $request);

        // Get filters for the frontend
        $filters = [
            'search' => $request->get('search'),
            'period' => $request->get('period'),
            'sort_by' => $request->get('sort_by'),
            'sort_direction' => $request->get('sort_direction'),
        ];

        return Inertia::render('budgets/BudgetsList', [
            'budgets' => $budgets,
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('create', Budget::class);
        return Inertia::render('budgets/CreateBudget');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBudgetRequest $request)
    {
        $budget = $this->budgetService->createBudget(auth()->user(), $request->validated());

        return redirect()->route('budgets.index')->with('success', 'Budget created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Budget $budget)
    {
        $this->authorize('view', $budget);

        return Inertia::render('budgets/BudgetDetail', [
            'budget' => $this->budgetService->getBudgetWithRelations($budget),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Budget $budget)
    {
        $this->authorize('update', $budget);
        return Inertia::render('budgets/EditBudget', [
            'budget' => $budget,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBudgetRequest $request, Budget $budget)
    {
        $this->budgetService->updateBudget($budget, $request->validated());

        return redirect()->route('budgets.show', $budget)
            ->with('success', 'Budget updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Budget $budget)
    {
        $this->authorize('delete', $budget);
        $this->budgetService->deleteBudget($budget);

        return redirect()->route('budgets.index')
            ->with('success', 'Budget deleted successfully.');
    }

    /**
     * Get budget statistics.
     */
    public function stats(Request $request)
    {
        return $this->budgetService->getBudgetStats(auth()->user(), $request->period);
    }

    /**
     * Get budget summary for dashboard.
     */
    public function summary(Request $request)
    {
        $period = $request->period ?? 'monthly';
        return $this->budgetService->getBudgetSummary(auth()->user(), $period);
    }
}
