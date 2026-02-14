<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\StatusEnums;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TontineMember extends Model
{
    use HasFactory;

    protected $fillable = [
        'tontine_id',
        'user_id',
        'priority_order',
        'is_admin',
    ];

    protected $casts = [
        'priority_order' => 'integer',
        'is_admin' => 'boolean',
    ];

    /**
     * Get the tontine that owns the member.
     */
    public function tontine(): BelongsTo
    {
        return $this->belongsTo(Tontine::class);
    }

    /**
     * Get the user that is a member.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the contributions for the member.
     */
    public function contributions(): HasMany
    {
        return $this->hasMany(TontineContribution::class);
    }

    /**
     * Get the payouts for the member.
     */
    public function payouts(): HasMany
    {
        return $this->hasMany(TontinePayout::class);
    }

    /**
     * Get total contributed amount.
     */
    public function getTotalContributedAttribute(): float|string
    {
        return $this->contributions()->where('status', 'paid')->sum('amount');
    }

    /**
     * Get total received amount.
     */
    public function getTotalReceivedAttribute(): float|string
    {
        return $this->payouts()->where('status', 'completed')->sum('amount');
    }

    /**
     * Check if member has pending contributions.
     */
    public function hasPendingContributions(): bool
    {
        return $this->contributions()->where('status', 'pending')->exists();
    }

    /**
     * Check if member has received payout.
     */
    public function hasReceivedPayout(): bool
    {
        return $this->payouts()->where('status', 'completed')->exists();
    }

    /**
     * Get member's contribution status for current period.
     */
    public function getCurrentPeriodStatus()
    {
        $contribution = $this->contributions()
            ->whereDate('contribution_date', now())
            ->first();

        return $contribution ? $contribution->status : StatusEnums::PENDING->value;
    }
}
