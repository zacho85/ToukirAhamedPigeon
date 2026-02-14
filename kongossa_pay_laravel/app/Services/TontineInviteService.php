<?php

namespace App\Services;

use App\Enums\StatusEnums;
use App\Http\Resources\TontineInviteResource;
use App\Mail\TontineInvitationMail;
use App\Models\Tontine;
use App\Models\TontineInvite;
use App\Models\TontineMember;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;
use Mail;

class TontineInviteService
{
    /**
     * Get paginated invites for a tontine.
     */
    public function getTontineInvites(Tontine $tontine, Request $request): AnonymousResourceCollection
    {
        $invites = $tontine->invites()
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->when($request->search, function ($query, $search) {
                return $query->where('email', 'like', "%{$search}%");
            })
            ->orderBy($request->sort_by ?? 'created_at', $request->sort_direction ?? 'desc')
            ->paginate($request->per_page ?? 15);

        return TontineInviteResource::collection($invites);
    }

    /**
     * Create a new invite for a tontine.
     */
    public function createInvite(Tontine $tontine, array $data): TontineInviteResource
    {
        $invite = $tontine->invites()->create([
            'email' => $data['email'],
            'status' => 'pending',
        ]);

        Mail::to($data['email'])->send(new TontineInvitationMail($invite, $tontine, auth()->user()));

        return new TontineInviteResource($invite->load('tontine'));
    }

    /**
     * Get an invite with its relationships.
     */
    public function getInviteWithRelations(TontineInvite $invite): TontineInviteResource
    {
        $invite->load('tontine.creator');
        return new TontineInviteResource($invite);
    }

    /**
     * Accept an invite and add user as member.
     */
    public function acceptInvite(string $token, User $user): JsonResponse
    {
        $invite = TontineInvite::where('invite_token', $token)->firstOrFail();

        if ($invite->status !== StatusEnums::PENDING) {
            throw new \Exception('Invite has already been responded to');
        }

        if ($invite->isExpired()) {
            throw new \Exception('Invite has expired');
        }


        if ($user->email !== $invite->email) {
            throw new \Exception('Invalid user for this invite');
        }

        // Check if user is already a member
        if ($invite->tontine->members()->where('user_id', $user->id)->exists()) {
            throw new \Exception('You are already a member of this tontine');
        }

        // Accept the invite
        $invite->accept();

        // Add user as member
        $nextPriority = $invite->tontine->members()->max('priority_order') + 1;

        TontineMember::create([
            'tontine_id' => $invite->tontine_id,
            'user_id' => $user->id,
            'priority_order' => $nextPriority,
            'is_admin' => false,
        ]);

        return response()->json(['message' => 'Invite accepted successfully']);
    }

    /**
     * Decline an invite.
     */
    public function declineInvite(string $token): JsonResponse
    {
        $invite = TontineInvite::where('invite_token', $token)->firstOrFail();

        if ($invite->status !== StatusEnums::PENDING) {
            throw new \Exception('Invite has already been responded to');
        }

        $invite->decline();

        return response()->json(['message' => 'Invite declined successfully']);
    }

    /**
     * Resend an invite.
     */
    public function resendInvite(TontineInvite $invite): JsonResponse
    {
        if ($invite->status !== StatusEnums::PENDING->value) {
            throw new \Exception('Can only resend pending invites');
        }

        // Generate new token
        $invite->update([
            'invite_token' => Str::random(32),
            'created_at' => now(), // Reset the creation time
        ]);

        // Send invitation email
        Mail::to($invite->email)->send(new TontineInvitationMail($invite, $invite->tontine, auth()->user()));

        return response()->json(['message' => 'Invite resent successfully']);
    }

    /**
     * Delete an invite.
     */
    public function deleteInvite(TontineInvite $invite): JsonResponse
    {
        $invite->delete();
        return response()->json(['message' => 'Invite deleted successfully']);
    }

    /**
     * Get invite by token for public viewing.
     */
    public function getInviteByToken(string $token): TontineInviteResource
    {
        $invite = TontineInvite::where('invite_token', $token)
            ->with('tontine.creator')
            ->firstOrFail();

        return new TontineInviteResource($invite);
    }
}
