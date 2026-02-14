<?php

namespace App\Services;

use App\Http\Resources\TontineContributionResource;
use App\Models\Tontine;
use App\Models\TontineContribution;
use App\Models\TontineMember;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\JsonResponse;

class TontineContributionService
{
    /**
     * Get paginated contributions for a member.
     */
    public function getMemberContributions(TontineMember $member, Request $request): AnonymousResourceCollection
    {
        $contributions = $member->contributions()
            ->with('tontineMember.user', 'tontineMember.tontine')
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->when($request->start_date && $request->end_date, function ($query) use ($request) {
                return $query->whereBetween('contribution_date', [$request->start_date, $request->end_date]);
            })
            ->orderBy($request->get('sort_by', 'contribution_date'), $request->get('sort_direction', 'desc'))
            ->paginate($request->get('per_page', 15));

        return TontineContributionResource::collection($contributions);
    }

    /**
     * Create a new contribution for a member.
     */
    public function createContribution(TontineMember $member, array $data): TontineContributionResource
    {
        $contribution = $member->contributions()->create($data);

        return new TontineContributionResource($contribution->load('tontineMember.user'));
    }

    /**
     * Get a contribution with its relationships.
     */
    public function getContributionWithRelations(TontineContribution $contribution): TontineContributionResource
    {
        $contribution->load('tontineMember.user');
        return new TontineContributionResource($contribution);
    }

    /**
     * Update a contribution.
     */
    public function updateContribution(TontineContribution $contribution, array $data): TontineContributionResource
    {
        $contribution->update($data);
        return new TontineContributionResource($contribution->load('tontineMember.user'));
    }

    /**
     * Delete a contribution.
     */
    public function deleteContribution(TontineContribution $contribution): JsonResponse
    {
        $contribution->delete();
        return response()->json(['message' => 'Contribution deleted successfully']);
    }

    /**
     * Mark contribution as paid.
     */
    public function markContributionAsPaid(TontineContribution $contribution): TontineContributionResource
    {
        $contribution->markAsPaid();
        return new TontineContributionResource($contribution->load('tontineMember.user'));
    }

    /**
     * Mark contribution as late.
     */
    public function markContributionAsLate(TontineContribution $contribution): TontineContributionResource
    {
        $contribution->markAsLate();
        return new TontineContributionResource($contribution->load('tontineMember.user'));
    }

    /**
     * Get all contributions for a tontine.
     */
    public function getTontineContributions(Tontine $tontine, Request $request): AnonymousResourceCollection
    {
        $contributions = TontineContribution::whereHas('tontineMember', function ($query) use ($tontine) {
            $query->where('tontine_id', $tontine->id);
        })
            ->with('tontineMember.user')
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->when($request->month, function ($query, $month) {
                return $query->whereMonth('contribution_date', $month);
            })
            ->when($request->year, function ($query, $year) {
                return $query->whereYear('contribution_date', $year);
            })
            ->orderBy($request->sort_by ?? 'contribution_date', $request->sort_direction ?? 'desc')
            ->paginate($request->per_page ?? 15);

        return TontineContributionResource::collection($contributions);
    }

    /**
     * Get contribution statistics for a tontine.
     */
    public function getTontineContributionStats(Tontine $tontine, ?string $startDate = null, ?string $endDate = null): JsonResponse
    {
        $startDate = $startDate ?? $tontine->created_at;
        $endDate = $endDate ?? now();

        $contributions = TontineContribution::whereHas('tontineMember', function ($query) use ($tontine) {
            $query->where('tontine_id', $tontine->id);
        })
            ->whereBetween('contribution_date', [$startDate, $endDate])
            ->get();

        $stats = [
            'period' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
            'total_contributions' => $contributions->count(),
            'total_amount' => $contributions->sum('amount'),
            'paid_contributions' => $contributions->where('status', 'paid')->count(),
            'pending_contributions' => $contributions->where('status', 'pending')->count(),
            'late_contributions' => $contributions->where('status', 'late')->count(),
            'paid_amount' => $contributions->where('status', 'paid')->sum('amount'),
            'pending_amount' => $contributions->where('status', 'pending')->sum('amount'),
            'collection_rate' => $contributions->count() > 0
                ? ($contributions->where('status', 'paid')->count() / $contributions->count()) * 100
                : 0,
        ];

        return response()->json($stats);
    }
}
