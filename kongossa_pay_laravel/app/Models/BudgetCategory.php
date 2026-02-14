<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BudgetCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'budget_id',
        'name',
        'color',
        'description',
        'limit_amount',
    ];

    protected $casts = [
        'limit_amount' => 'decimal:2',
    ];

    /**
     * Get the budget that owns the category.
     */
    public function budget(): BelongsTo
    {
        return $this->belongsTo(Budget::class);
    }

    /**
     * Get the expenses for the category.
     */
    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    /**
     * Calculate total spent amount for this category.
     */
    public function getTotalSpentAttribute(): float
    {
        return $this->expenses()->sum('amount');
    }

    /**
     * Calculate remaining amount for this category.
     */
    public function getRemainingAmountAttribute(): float
    {
        return $this->limit_amount - $this->total_spent;
    }

    /**
     * Check if category is over limit.
     */
    public function isOverLimit(): bool
    {
        return $this->total_spent > $this->limit_amount;
    }

    /**
     * Get percentage of budget used.
     */
    public function getUsagePercentageAttribute(): float
    {
        if ($this->limit_amount == 0) {
            return 0;
        }
        return ($this->total_spent / $this->limit_amount) * 100;
    }
}
