<?php

namespace App\Models;

use App\Enums\StatusEnums;
use App\Enums\TimePeriodEnums;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class TontineInvite extends Model
{
    use HasFactory;

    protected $fillable = [
        'tontine_id',
        'email',
        'invite_token',
        'status',
    ];

    protected $casts = [
        'status' => StatusEnums::class,
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($invite) {
            if (empty($invite->invite_token)) {
                $invite->invite_token = Str::random(32);
            }
        });
    }

    /**
     * Get the tontine that owns the invite.
     */
    public function tontine(): BelongsTo
    {
        return $this->belongsTo(Tontine::class);
    }

    /**
     * Scope to filter pending invites.
     */
    public function scopePending($query)
    {
        return $query->where('status', StatusEnums::PENDING);
    }

    /**
     * Scope to filter accepted invites.
     */
    public function scopeAccepted($query)
    {
        return $query->where('status', StatusEnums::ACCEPTED);
    }

    /**
     * Scope to filter declined invites.
     */
    public function scopeDeclined($query)
    {
        return $query->where('status', StatusEnums::DECLINED);
    }

    /**
     * Check if invite is expired (older than 7 days).
     */
    public function isExpired(): bool
    {
        return $this->created_at->addHours(TimePeriodEnums::DAY_IN_HOURS->value)->isPast();
    }

    /**
     * Accept the invite.
     */
    public function accept(): void
    {
        $this->update(['status' => StatusEnums::ACCEPTED]);
    }

    /**
     * Decline the invite.
     */
    public function decline(): void
    {
        $this->update(['status' => StatusEnums::DECLINED]);
    }

    /**
     * Generate invite URL.
     */
    public function getInviteUrlAttribute(): string
    {
        return url("/tontine/invite/{$this->invite_token}");
    }

    /**
     * Check if user with this email already exists.
     */
    public function getInvitedUserAttribute()
    {
        return User::where('email', $this->email)->first();
    }
}
