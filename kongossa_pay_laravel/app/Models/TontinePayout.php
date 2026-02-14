<?php

namespace App\Models;

use App\Enums\StatusEnums;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TontinePayout extends Model
{
    use HasFactory;

    protected $fillable = [
        'tontine_member_id',
        'amount',
        'payout_date',
        'status',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payout_date' => 'date',
        'status' => StatusEnums::class,
    ];

    /**
     * Get the tontine member that owns the payout.
     */
    public function tontineMember(): BelongsTo
    {
        return $this->belongsTo(TontineMember::class);
    }

    /**
     * Get the tontine through the member.
     */
    public function tontine(): BelongsTo
    {
        return $this->tontineMember()->tontine();
    }

    /**
     * Get the user through the member.
     */
    public function user()
    {
        return $this->tontineMember()->user();
    }

    /**
     * Scope to filter scheduled payouts.
     */
    public function scopeScheduled($query)
    {
        return $query->where('status', StatusEnums::SCHEDULED);
    }

    /**
     * Scope to filter completed payouts.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', StatusEnums::COMPLETED);
    }

    /**
     * Scope to filter payouts for current month.
     */
    public function scopeCurrentMonth($query)
    {
        return $query->whereMonth('payout_date', now()->month)
            ->whereYear('payout_date', now()->year);
    }

    /**
     * Scope to filter upcoming payouts.
     */
    public function scopeUpcoming($query)
    {
        return $query->where('status', StatusEnums::SCHEDULED)
            ->where('payout_date', '>=', now());
    }

    /**
     * Check if payout is due.
     */
    public function isDue(): bool
    {
        return $this->status === StatusEnums::SCHEDULED && Carbon::parse($this->payout_date)->isToday();
    }

    /**
     * Check if payout is overdue.
     */
    public function isOverdue(): bool
    {
        return $this->status === StatusEnums::SCHEDULED && Carbon::parse($this->payout_date)->isPast();
    }

    /**
     * Mark payout as completed.
     */
    public function markAsCompleted(): void
    {
        $this->update(['status' => StatusEnums::COMPLETED]);
    }
}
