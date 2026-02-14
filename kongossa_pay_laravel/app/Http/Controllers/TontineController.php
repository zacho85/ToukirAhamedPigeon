<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Tontine;
use Illuminate\Http\Request;
use App\Enums\TontineTypeEnums;
use App\Services\TontineService;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\Tontine\StoreTontineRequest;
use App\Http\Requests\Tontine\UpdateTontineRequest;

class TontineController extends Controller
{
    public function __construct(private TontineService $tontineService)
    {
        //
    }

    /**
     * Display a listing of the user's tontines.
     */
    public function index(Request $request)
    {
        $tontines = $this->tontineService->getUserTontines(Auth::user(), $request);

        // Get filters for the frontend
        $filters = [
            'search' => $request->get('search'),
            'type' => $request->get('type'),
            'status' => $request->get('status'),
            'sort_by' => $request->get('sort_by'),
            'sort_direction' => $request->get('sort_direction'),
        ];

        return Inertia::render('tontines/TontinesList', [
            'tontines' => $tontines,
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating a new tontine.
     */
    public function create()
    {
        $this->authorize('create', Tontine::class);
        return Inertia::render('tontines/CreateTontine', [
            'tontineTypes' => array_map(function ($type) {
                return TontineTypeEnums::from($type->value)->toArray();
            }, TontineTypeEnums::cases()),
        ]);
    }

    /**
     * Store a newly created tontine in storage.
     */
    public function store(StoreTontineRequest $request)
    {
        $tontine = $this->tontineService->createTontine(Auth::user(), $request->validated());

        return redirect()->route('tontines.show', $tontine->id)
            ->with('success', 'Tontine created successfully.');
    }

    /**
     * Display the specified tontine.
     */
    public function show(Tontine $tontine)
    {
        $this->authorize('view', $tontine);
        return Inertia::render('tontines/TontineDetail', [
            'tontine' => $this->tontineService->getTontineWithRelations($tontine),
        ]);
    }

    /**
     * Show the form for editing the specified tontine.
     */
    public function edit(Tontine $tontine)
    {
        $this->authorize('update', $tontine);
        return Inertia::render('tontines/EditTontine', [
            'tontine' => $tontine,
            'tontineTypes' => array_map(function ($type) {
                return TontineTypeEnums::from($type->value)->toArray();
            }, TontineTypeEnums::cases()),
        ]);
    }

    /**
     * Update the specified tontine in storage.
     */
    public function update(UpdateTontineRequest $request, Tontine $tontine)
    {
        $this->authorize('update', $tontine);
        $this->tontineService->updateTontine($tontine, $request->validated());

        return redirect()->route('tontines.show', $tontine)
            ->with('success', 'Tontine updated successfully.');
    }

    /**
     * Remove the specified tontine from storage.
     */
    public function destroy(Tontine $tontine)
    {
        $this->authorize('delete', $tontine);

        $this->tontineService->deleteTontine($tontine);

        return redirect()->route('tontines.index')
            ->with('success', 'Tontine deleted successfully.');
    }

    /**
     * Get tontine statistics.
     */
    public function stats(Tontine $tontine)
    {
        $this->authorize('view', $tontine);

        return $this->tontineService->getTontineStats($tontine);
    }

    /**
     * Get dashboard summary for user's tontines.
     */
    public function dashboard(Request $request)
    {
        // return $this->tontineService->getUserDashboardSummary(auth()->user());
    }
}
