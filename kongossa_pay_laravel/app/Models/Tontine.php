<?php

namespace App\Models;

use App\Enums\FrequencyEnums;
use App\Enums\StatusEnums;
use Auth;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tontine extends Model
{
    use HasFactory;

    protected $fillable = [
        'created_by',
        'name',
        'type',
        'contribution_amount',
        'frequency',
        'duration_months',
        'status',
        'max_members',
        'stripe_price_id',
    ];

    protected $casts = [
        'frequency' => FrequencyEnums::class,
        'contribution_amount' => 'decimal:2',
        'duration_months' => 'integer',
        'status' => StatusEnums::class,
    ];

    /**
     * Get the user who created the tontine.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the members of the tontine.
     */
    public function members(): HasMany
    {
        return $this->hasMany(TontineMember::class);
    }

    /**
     * Get the invites for the tontine.
     */
    public function invites(): HasMany
    {
        return $this->hasMany(TontineInvite::class);
    }

    /**
     * Get all contributions through members.
     */
    public function contributions()
    {
        return $this->hasManyThrough(TontineContribution::class, TontineMember::class);
    }

    /**
     * Get all payouts through members.
     */
    public function payouts()
    {
        return $this->hasManyThrough(TontinePayout::class, TontineMember::class);
    }

    /**
     * Get total amount collected.
     */
    public function getTotalCollectedAttribute(): float
    {
        return $this->contributions()->where('status', 'paid')->sum('amount');
    }

    /**
     * Get total amount paid out.
     */
    public function getTotalPaidOutAttribute(): float
    {
        return $this->payouts()->where('status', 'completed')->sum('amount');
    }

    /**
     * Check if tontine is active.
     */
    public function isActive(): bool
    {
        return $this->created_at->addMonths($this->duration_months)->isFuture();
    }

    /**
     * Get next payout member.
     */
    public function getNextPayoutMember()
    {
        return $this->members()
            ->whereDoesntHave('payouts', function ($query) {
                $query->where('status', 'completed');
            })
            ->orderBy('priority_order')
            ->first();
    }

    /**
     * Calculate expected total per cycle.
     */
    public function getExpectedTotalAttribute(): float
    {
        $membersCount = $this->members()->count();
        return $this->contribution_amount * $membersCount;
    }

    /**
     * Check if user is admin of tontine.
     */
    public function isAdmin(User|null $user): bool
    {
        if (is_null($user))
            return false;

        return $this->members()->where('user_id', $user->id)->where('is_admin', true)->exists();
    }
}
