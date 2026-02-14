<?php

namespace App\Models;

use App\Enums\PeriodEnums;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Budget extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'period',
        'total_amount',
    ];

    protected $casts = [
        'period' => PeriodEnums::class,
        'total_amount' => 'decimal:2',
    ];

    /**
     * Get the user that owns the budget.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the budget categories for the budget.
     */
    public function budgetCategories(): HasMany
    {
        return $this->hasMany(BudgetCategory::class);
    }

    /**
     * Get all expenses through budget categories.
     */
    public function expenses()
    {
        return $this->hasManyThrough(Expense::class, BudgetCategory::class);
    }

    /**
     * Calculate total spent amount across all categories.
     */
    public function getTotalSpentAttribute(): float
    {
        return $this->expenses()->sum('amount');
    }

    /**
     * Calculate remaining budget amount.
     */
    public function getRemainingAmountAttribute(): float
    {
        return $this->total_amount - $this->total_spent;
    }

    /**
     * Check if budget is over limit.
     */
    public function isOverBudget(): bool
    {
        return $this->total_spent > $this->total_amount;
    }
}
