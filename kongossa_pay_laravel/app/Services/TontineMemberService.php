<?php

namespace App\Services;

use App\Http\Resources\TontineMemberResource;
use App\Models\Tontine;
use App\Models\TontineMember;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;

class TontineMemberService
{
    /**
     * Get paginated members for a tontine.
     */
    public function getTontineMembers(Tontine $tontine, Request $request): AnonymousResourceCollection
    {
        $members = $tontine->members()
            ->with(['user', 'contributions', 'payouts'])
            ->when($request->search, function ($query, $search) {
                return $query->whereHas('user', function ($userQuery) use ($search) {
                    $userQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->orderBy($request->sort_by ?? 'priority_order', $request->sort_direction ?? 'asc')
            ->paginate($request->per_page ?? 15);

        return TontineMemberResource::collection($members);
    }

    /**
     * Add a user to a tontine as a member.
     */
    public function addMemberToTontine(Tontine $tontine, array $data): TontineMemberResource
    {
        // Check if user is already a member
        if ($tontine->members()->where('user_id', $data['user_id'])->exists()) {
            throw new \Exception('User is already a member of this tontine');
        }

        // Auto-assign priority order if not provided
        $priorityOrder = $data['priority_order'] ??
            ($tontine->members()->max('priority_order') + 1);

        $member = TontineMember::create([
            'tontine_id' => $tontine->id,
            'user_id' => $data['user_id'],
            'priority_order' => $priorityOrder,
            'is_admin' => false,
        ]);

        return new TontineMemberResource($member->load(['user', 'tontine']));
    }

    /**
     * Get a member with its relationships.
     */
    public function getMemberWithRelations(TontineMember $member): TontineMemberResource
    {
        $member->load(['user', 'tontine', 'contributions', 'payouts']);
        return new TontineMemberResource($member);
    }

    /**
     * Update a tontine member.
     */
    public function updateMember(TontineMember $member, array $data): TontineMemberResource
    {
        $member->update($data);
        return new TontineMemberResource($member->load(['user', 'tontine']));
    }

    /**
     * Remove a member from a tontine.
     */
    public function removeMember(TontineMember $member): JsonResponse
    {
        // Prevent removing member if they have contributions or payouts
        if ($member->contributions()->exists() || $member->payouts()->exists()) {
            throw new \Exception('Cannot remove member who has contributions or payouts');
        }

        $member->delete();
        return response()->json(['message' => 'Member removed successfully']);
    }

    /**
     * Get member statistics.
     */
    public function getMemberStats(TontineMember $member): JsonResponse
    {
        $stats = [
            'total_contributed' => $member->total_contributed,
            'total_received' => $member->total_received,
            'contribution_count' => $member->contributions()->count(),
            'payout_count' => $member->payouts()->count(),
            'pending_contributions' => $member->contributions()
                ->where('status', 'pending')
                ->count(),
            'late_contributions' => $member->contributions()
                ->where('status', 'late')
                ->count(),
            'has_received_payout' => $member->hasReceivedPayout(),
            'current_period_status' => $member->getCurrentPeriodStatus(),
            'next_payout_position' => $member->tontine->members()
                ->where('priority_order', '<', $member->priority_order)
                ->whereDoesntHave('payouts', function ($query) {
                    $query->where('status', 'completed');
                })
                ->count() + 1,
        ];

        return response()->json($stats);
    }
}
