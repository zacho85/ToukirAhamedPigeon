<?php

namespace App\Http\Controllers;

use App\Models\Tontine;
use App\Models\TontineMember;
use App\Services\TontineMemberService;
use Illuminate\Http\Request;

class TontineMemberController extends Controller
{
    public function __construct(private TontineMemberService $memberService)
    {
        //
    }

    /**
     * Display a listing of tontine members.
     */
    public function index(Request $request, Tontine $tontine)
    {
        $this->authorize('view', $tontine);

        return $this->memberService->getTontineMembers($tontine, $request);
    }

    /**
     * Add a user to the tontine.
     */
    public function store(Request $request, Tontine $tontine)
    {
        $this->authorize('addMember', $tontine);

        $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'priority_order' => ['nullable', 'integer', 'min:1'],
        ]);

        try {
            return $this->memberService->addMemberToTontine($tontine, $request->only(['user_id', 'priority_order']));
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * Display the specified member.
     */
    public function show(TontineMember $tontineMember)
    {
        $this->authorize('view', $tontineMember->tontine);

        return $this->memberService->getMemberWithRelations($tontineMember);
    }

    /**
     * Update the specified member.
     */
    public function update(Request $request, TontineMember $tontineMember)
    {
        $this->authorize('updateMember', $tontineMember->tontine);

        $request->validate([
            'priority_order' => ['nullable', 'integer', 'min:1'],
            'is_admin' => ['nullable', 'boolean'],
        ]);

        return $this->memberService->updateMember(
            $tontineMember,
            $request->only(['priority_order', 'is_admin'])
        );
    }

    /**
     * Remove the specified member from storage.
     */
    public function destroy(TontineMember $tontineMember)
    {
        $this->authorize('removeMember', $tontineMember->tontine);

        try {
            return $this->memberService->removeMember($tontineMember);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * Get member statistics.
     */
    public function stats(TontineMember $tontineMember)
    {
        $this->authorize('view', $tontineMember->tontine);

        return $this->memberService->getMemberStats($tontineMember);
    }
}
