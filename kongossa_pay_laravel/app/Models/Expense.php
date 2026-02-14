<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        'budget_category_id',
        'title',
        'amount',
        'expense_date',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'expense_date' => 'date',
    ];

    /**
     * Get the budget category that owns the expense.
     */
    public function budgetCategory(): BelongsTo
    {
        return $this->belongsTo(BudgetCategory::class);
    }

    /**
     * Get the budget through the category.
     */
    public function budget(): BelongsTo
    {
        return $this->budgetCategory()->budget();
    }

    /**
     * Get the user through the budget and category.
     */
    public function user()
    {
        return $this->hasOneThrough(User::class, Budget::class, 'id', 'id', 'budget_category_id', 'user_id');
    }

    /**
     * Scope to filter expenses by date range.
     */
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('expense_date', [$startDate, $endDate]);
    }

    /**
     * Scope to filter expenses for current month.
     */
    public function scopeCurrentMonth($query)
    {
        return $query->whereMonth('expense_date', now()->month)
            ->whereYear('expense_date', now()->year);
    }

    /**
     * Scope to filter expenses for current week.
     */
    public function scopeCurrentWeek($query)
    {
        return $query->whereBetween('expense_date', [
            now()->startOfWeek(),
            now()->endOfWeek()
        ]);
    }
}
