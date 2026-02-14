<?php

namespace App\Http\Controllers;

use App\Http\Requests\TontineContribution\StoreTontineContributionRequest;
use App\Models\Tontine;
use App\Models\TontineContribution;
use App\Models\TontineMember;
use App\Services\TontineContributionService;
use Illuminate\Http\Request;

class TontineContributionController extends Controller
{
    public function __construct(private TontineContributionService $contributionService)
    {
        //
    }

    /**
     * Display a listing of contributions for a member.
     */
    public function index(Request $request)
    {
        $tontineMember = TontineMember::where('user_id', auth()->user()->id)->first();

        $tontines = Tontine::all();
        $filters = [
            'search' => $request->get('search'),
            'status' => $request->get('status'),
            'sort_by' => $request->get('sort_by'),
            'sort_direction' => $request->get('sort_direction'),
        ];
        return inertia('contribution/ContributionList', [
            'contributions' => $tontineMember ? $this->contributionService->getMemberContributions($tontineMember, $request) : [],
            'filters' => $filters,
            'tontines' => $tontines,
        ]);
    }

    /**
     * Store a newly created contribution in storage.
     */
    public function store(StoreTontineContributionRequest $request, TontineMember $tontineMember)
    {
        return $this->contributionService->createContribution($tontineMember, $request->validated());
    }

    /**
     * Display the specified contribution.
     */
    public function show(TontineContribution $tontineContribution)
    {
        $this->authorize('view', $tontineContribution->tontineMember->tontine);

        return $this->contributionService->getContributionWithRelations($tontineContribution);
    }

    /**
     * Update the specified contribution in storage.
     */
    public function update(Request $request, TontineContribution $tontineContribution)
    {
        $this->authorize('updateContribution', $tontineContribution->tontineMember->tontine);

        $request->validate([
            'amount' => ['sometimes', 'numeric', 'min:0.01', 'max:999999.99'],
            'contribution_date' => ['sometimes', 'date', 'before_or_equal:today'],
            'status' => ['sometimes', 'string', 'in:pending,paid,late'],
        ]);

        return $this->contributionService->updateContribution(
            $tontineContribution,
            $request->only(['amount', 'contribution_date', 'status'])
        );
    }

    /**
     * Remove the specified contribution from storage.
     */
    public function destroy(TontineContribution $tontineContribution)
    {
        $this->authorize('deleteContribution', $tontineContribution->tontineMember->tontine);

        return $this->contributionService->deleteContribution($tontineContribution);
    }

    /**
     * Mark contribution as paid.
     */
    public function markAsPaid(TontineContribution $tontineContribution)
    {
        $this->authorize('updateContribution', $tontineContribution->tontineMember->tontine);

        return $this->contributionService->markContributionAsPaid($tontineContribution);
    }

    /**
     * Mark contribution as late.
     */
    public function markAsLate(TontineContribution $tontineContribution)
    {
        $this->authorize('updateContribution', $tontineContribution->tontineMember->tontine);

        return $this->contributionService->markContributionAsLate($tontineContribution);
    }

    /**
     * Get contributions for all members of a tontine.
     */
    public function tontineContributions(Request $request, Tontine $tontine)
    {
        $this->authorize('view', $tontine);

        return $this->contributionService->getTontineContributions($tontine, $request);
    }

    /**
     * Get contribution statistics for a tontine.
     */
    public function stats(Request $request, Tontine $tontine)
    {
        $this->authorize('view', $tontine);

        return $this->contributionService->getTontineContributionStats(
            $tontine,
            $request->start_date,
            $request->end_date
        );
    }


    function tontineContribute(Request $request, Tontine $tontine)
    {
        $this->authorize('view', $tontine);

        return $request->user()->checkout($tontine->stripe_price_id, [
            'success_url' => route('stripe.checkout-success') . '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => route('stripe.checkout-cancel'),
            'metadata' => ['tontine_id' => $tontine->id, 'user_id' => auth()->user()->id],
        ]);
    }


}
