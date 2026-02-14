<?php

namespace App\Http\Controllers;

use App\Enums\StatusEnums;
use App\Http\Requests\TontineInvite\StoreTontineInviteRequest;
use App\Models\Tontine;
use App\Models\TontineInvite;
use App\Models\User;
use App\Services\TontineInviteService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TontineInviteController extends Controller
{
    public function __construct(private TontineInviteService $inviteService)
    {
        //
    }

    /**
     * Display a listing of user's invitations.
     */
    public function index(Request $request)
    {
        // Get user's pending invitations
        $invites = TontineInvite::where('email', auth()->user()->email)
            ->with('tontine')
            ->whereIn('status', [StatusEnums::PENDING->value])
            ->get()
            ->map(function ($invite) {
                return [
                    'id' => $invite->id,
                    'email' => $invite->email,
                    'status' => $invite->status,
                    'created_at' => $invite->created_at,
                    'tontine' => [
                        'id' => $invite->tontine->id,
                        'name' => $invite->tontine->name,
                        'type' => $invite->tontine->type,
                        'contribution_amount' => $invite->tontine->contribution_amount,
                        'frequency' => $invite->tontine->frequency,
                    ]
                ];
            });

        return Inertia::render('invitations/InvitationsList', [
            'invites' => $invites,
        ]);
    }

    /**
     * Store a newly created invite in storage.
     */
    public function store(StoreTontineInviteRequest $request, Tontine $tontine = null)
    {
        // If tontine is provided via route parameter, use it
        // Otherwise, get it from the form data
        if (!$tontine) {
            $tontine = Tontine::findOrFail($request->tontine_id);
        }

        $this->authorize('view', $tontine);
        $invite = $this->inviteService->createInvite($tontine, $request->validated());

        return redirect()->route('tontines.show', $tontine)
            ->with('success', 'Invitation sent successfully.');
    }

    /**
     * Display the specified invite.
     */
    public function show(TontineInvite $tontineInvite)
    {
        $inviteData = $this->inviteService->getInviteByToken($tontineInvite->invite_token);

        return Inertia::render('invitations/InvitationDetail', [
            'invite' => $inviteData->getData(),
        ]);
    }

    /**
     * Accept the invite.
     */
    public function accept(TontineInvite $tontineInvite)
    {
        try {
            $this->inviteService->acceptInvite($tontineInvite->invite_token, auth()->user());

            return redirect()->route('tontines.show', $tontineInvite->tontine)
                ->with('success', 'Invitation accepted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Decline the invite.
     */
    public function decline(TontineInvite $tontineInvite)
    {
        try {
            $this->inviteService->declineInvite($tontineInvite->invite_token);

            return redirect()->route('invitations')
                ->with('success', 'Invitation declined.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Resend the invite.
     */
    public function resend(TontineInvite $tontineInvite)
    {
        $this->authorize('update', $tontineInvite->tontine);

        try {
            $this->inviteService->resendInvite($tontineInvite);

            return redirect()->back()
                ->with('success', 'Invitation resent successfully.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Remove the specified invite from storage.
     */
    public function destroy(TontineInvite $tontineInvite)
    {
        $this->authorize('update', $tontineInvite->tontine);
        $this->inviteService->deleteInvite($tontineInvite);

        return redirect()->back()
            ->with('success', 'Invitation deleted successfully.');
    }

    /**
     * Get invite by token (for public viewing).
     */
    public function getByToken(string $token)
    {
        $invitation = $this->inviteService->getInviteByToken($token);

        $hasEmail = User::where('email', $invitation->email)->exists();

        if ($hasEmail) {
            return redirect()->route('login');
        }

        return Inertia::render('invitations/PublicInvitation', [
            'invitation' => $invitation,
            'token' => $token,
        ]);
    }
}
