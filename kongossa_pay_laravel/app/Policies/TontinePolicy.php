<?php

namespace App\Policies;

use App\Models\Tontine;
use App\Models\User;

class TontinePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Tontine $tontine): bool
    {
        return $tontine->created_by === $user->id ||
            $tontine->members()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Tontine $tontine): bool
    {
        return $tontine->created_by === $user->id ||
            $tontine->members()->where('user_id', $user->id)->where('is_admin', true)->exists();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Tontine $tontine): bool
    {
        return $tontine->created_by === $user->id;
    }

    /**
     * Determine whether the user can add members to the tontine.
     */
    public function addMember(User $user, Tontine $tontine): bool
    {
        return $tontine->created_by === $user->id ||
            $tontine->members()->where('user_id', $user->id)->where('is_admin', true)->exists();
    }

    /**
     * Determine whether the user can update members of the tontine.
     */
    public function updateMember(User $user, Tontine $tontine): bool
    {
        return $tontine->created_by === $user->id ||
            $tontine->members()->where('user_id', $user->id)->where('is_admin', true)->exists();
    }

    /**
     * Determine whether the user can remove members from the tontine.
     */
    public function removeMember(User $user, Tontine $tontine): bool
    {
        return $tontine->created_by === $user->id ||
            $tontine->members()->where('user_id', $user->id)->where('is_admin', true)->exists();
    }

    /**
     * Determine whether the user can send invites for the tontine.
     */
    public function sendInvite(User $user, Tontine $tontine): bool
    {
        return $tontine->created_by === $user->id ||
            $tontine->members()->where('user_id', $user->id)->where('is_admin', true)->exists();
    }

    /**
     * Determine whether the user can delete invites for the tontine.
     */
    public function deleteInvite(User $user, Tontine $tontine): bool
    {
        return $tontine->created_by === $user->id ||
            $tontine->members()->where('user_id', $user->id)->where('is_admin', true)->exists();
    }

    /**
     * Determine whether the user can update contributions in the tontine.
     */
    public function updateContribution(User $user, Tontine $tontine): bool
    {
        return $tontine->created_by === $user->id ||
            $tontine->members()->where('user_id', $user->id)->where('is_admin', true)->exists();
    }

    /**
     * Determine whether the user can delete contributions in the tontine.
     */
    public function deleteContribution(User $user, Tontine $tontine): bool
    {
        return $tontine->created_by === $user->id ||
            $tontine->members()->where('user_id', $user->id)->where('is_admin', true)->exists();
    }
}
