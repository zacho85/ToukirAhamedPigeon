<?php

namespace App\Services;

use App\Http\Resources\TontineCollection;
use App\Http\Resources\TontineResource;
use App\Models\Tontine;
use App\Models\TontineMember;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Laravel\Cashier\Cashier;

class TontineService
{
    /**
     * Get paginated tontines for a user.
     */
    public function getUserTontines(User $user, Request $request)
    {
        $tontines = Tontine::where(function ($query) use ($user) {
            $query->where('created_by', $user->id)
                ->orWhereHas('members', function ($subQuery) use ($user) {
                    $subQuery->where('user_id', $user->id);
                });
        })
            ->when($request->type, function ($query, $type) {
                return $query->where('type', $type);
            })
            ->when($request->frequency, function ($query, $frequency) {
                return $query->where('frequency', $frequency);
            })
            ->when($request->status, function ($query, $status) {
                if ($status === 'active') {
                    return $query->whereRaw('created_at > DATE_SUB(NOW(), INTERVAL duration_months MONTH)');
                }
                return $query;
            })
            ->when($request->search, function ($query, $search) {
                return $query->where('name', 'like', "%{$search}%");
            })
            ->with(['creator', 'members.user'])
            ->orderBy($request->sort_by ?? 'created_at', $request->sort_direction ?? 'desc')
            ->paginate($request->per_page ?? 15);

        return TontineResource::collection($tontines);
    }

    /**
     * Create a new tontine and add creator as admin member.
     */
    public function createTontine(User $user, array $data): TontineResource
    {
        $tontine = Tontine::create(array_merge($data, [
            'created_by' => $user->id,
        ]));

        $price = Cashier::stripe()->prices->create([
            'product' => config('cashier.product_id'),
            'unit_amount' => (float) $tontine->contribution_amount * 100,
            'currency' => 'usd',
            'metadata' => ['tontine_id' => $tontine->id],
        ]);

        $tontine->update([
            'stripe_price_id' => $price->id
        ]);

        // Add creator as admin member with priority 1
        TontineMember::create([
            'tontine_id' => $tontine->id,
            'user_id' => $user->id,
            'priority_order' => 1,
            'is_admin' => true,
        ]);

        return new TontineResource($tontine->load(['creator', 'members.user']));
    }

    /**
     * Get a tontine with all its relationships.
     */
    public function getTontineWithRelations(Tontine $tontine): TontineResource
    {
        $tontine->load([
            'creator',
            'members.user',
            'members.contributions',
            'members.payouts',
            'invites'
        ]);

        return new TontineResource($tontine);
    }

    /**
     * Update a tontine.
     */
    public function updateTontine(Tontine $tontine, array $data): TontineResource
    {
        // cashier price update
        if (is_null($tontine->stripe_price_id)) {
            $price = Cashier::stripe()->prices->create([
                'product' => config('cashier.product_id'),
                'unit_amount' => (float) $tontine->contribution_amount * 100,
                'currency' => 'usd',
                'metadata' => ['tontine_id' => $tontine->id],
            ]);
            $tontine->update(['stripe_price_id' => $price->id]);
        }

        if ($tontine->isDirty('contribution_amount')) {
            $data['contribution_amount'] = $tontine->contribution_amount;
        }

        $tontine->update($data);

        return new TontineResource($tontine->load(['creator', 'members.user']));
    }

    /**
     * Delete a tontine.
     */
    public function deleteTontine(Tontine $tontine): JsonResponse
    {
        if ($tontine->stripe_price_id) {
            Cashier::stripe()->prices->update($tontine->stripe_price_id, ['active' => false]);
        }

        $tontine->delete();
        return response()->json(['message' => 'Tontine deleted successfully']);
    }

    /**
     * Get tontine statistics.
     */
    public function getTontineStats(Tontine $tontine): JsonResponse
    {
        $stats = [
            'total_members' => $tontine->members()->count(),
            'total_collected' => $tontine->total_collected,
            'total_paid_out' => $tontine->total_paid_out,
            'expected_total_per_cycle' => $tontine->expected_total,
            'is_active' => $tontine->isActive(),
            'completion_percentage' => $tontine->duration_months > 0
                ? (now()->diffInMonths($tontine->created_at) / $tontine->duration_months) * 100
                : 0,
            'next_payout_member' => $tontine->getNextPayoutMember(),
            'pending_contributions' => $tontine->contributions()
                ->where('status', 'pending')
                ->count(),
            'late_contributions' => $tontine->contributions()
                ->where('status', 'late')
                ->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Get dashboard summary for user's tontines.
     */
    public function getTontineDashboard(User $user): JsonResponse
    {
        $userTontines = Tontine::where(function ($query) use ($user) {
            $query->where('created_by', $user->id)
                ->orWhereHas('members', function ($subQuery) use ($user) {
                    $subQuery->where('user_id', $user->id);
                });
        })
            ->with(['members'])
            ->get();

        $summary = [
            'total_tontines' => $userTontines->count(),
            'created_tontines' => $userTontines->where('created_by', $user->id)->count(),
            'member_tontines' => $userTontines->where('created_by', '!=', $user->id)->count(),
            'active_tontines' => $userTontines->filter(function ($tontine) {
                return $tontine->isActive();
            })->count(),
            'total_contributed' => $userTontines->sum(function ($tontine) use ($user) {
                $member = $tontine->members()->where('user_id', $user->id)->first();
                return $member ? $member->total_contributed : 0;
            }),
            'total_received' => $userTontines->sum(function ($tontine) use ($user) {
                $member = $tontine->members()->where('user_id', $user->id)->first();
                return $member ? $member->total_received : 0;
            }),
            'upcoming_payouts' => $userTontines->flatMap(function ($tontine) use ($user) {
                return $tontine->payouts()
                    ->where('status', 'scheduled')
                    ->where('payout_date', '>=', now())
                    ->whereHas('tontineMember', function ($query) use ($user) {
                        $query->where('user_id', $user->id);
                    })
                    ->orderBy('payout_date')
                    ->limit(3)
                    ->get();
            }),
        ];

        return response()->json($summary);
    }
}
