<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Cashier\Billable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, Billable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'status',
        'user_type',
        'company_name',
        'company_legal_form',
        'manager_name',
        'company_phone',
        'company_address',
        'legal_form_document',
        'business_description',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Get the budgets for the user.
     */
    public function budgets(): HasMany
    {
        return $this->hasMany(Budget::class);
    }

    /**
     * Get the tontines created by the user.
     */
    public function createdTontines(): HasMany
    {
        return $this->hasMany(Tontine::class, 'created_by');
    }

    /**
     * Get the tontine memberships for the user.
     */
    public function tontineMembers(): HasMany
    {
        return $this->hasMany(TontineMember::class);
    }

    /**
     * Get all tontines where user is a member (including those they created).
     */
    public function tontines()
    {
        return Tontine::where(function ($query) {
            $query->where('created_by', $this->id)
                ->orWhereHas('members', function ($subQuery) {
                    $subQuery->where('user_id', $this->id);
                });
        });
    }

    public function tontineInvites()
    {
        return $this->hasMany(TontineInvite::class);
    }
}
