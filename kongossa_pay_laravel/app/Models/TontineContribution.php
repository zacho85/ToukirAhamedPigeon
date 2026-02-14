<?php

namespace App\Models;

use App\Enums\StatusEnums;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TontineContribution extends Model
{
    use HasFactory;

    protected $fillable = [
        'tontine_member_id',
        'amount',
        'contribution_date',
        'status',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'contribution_date' => 'date',
        'status' => StatusEnums::class,
    ];

    /**
     * Get the tontine member that owns the contribution.
     */
    public function tontineMember(): BelongsTo
    {
        return $this->belongsTo(TontineMember::class);
    }

    /**
     * Scope to filter paid contributions.
     */
    public function scopePaid($query)
    {
        return $query->where('status', StatusEnums::PENDING);
    }

    /**
     * Scope to filter pending contributions.
     */
    public function scopePending($query)
    {
        return $query->where('status', StatusEnums::PENDING);
    }

    /**
     * Scope to filter late contributions.
     */
    public function scopeLate($query)
    {
        return $query->where('status', 'late');
    }

    /**
     * Scope to filter contributions for current month.
     */
    public function scopeCurrentMonth($query)
    {
        return $query->whereMonth('contribution_date', now()->month)
            ->whereYear('contribution_date', now()->year);
    }

    /**
     * Check if contribution is overdue.
     */
    public function isOverdue(): bool
    {
        return $this->status === StatusEnums::PENDING &&
            Carbon::parse($this->contribution_date)->isPast();
    }

    /**
     * Mark contribution as paid.
     */
    public function markAsPaid(): void
    {
        $this->update(['status' => 'paid']);
    }

    /**
     * Mark contribution as late.
     */
    public function markAsLate(): void
    {
        $this->update(['status' => 'late']);
    }
}
