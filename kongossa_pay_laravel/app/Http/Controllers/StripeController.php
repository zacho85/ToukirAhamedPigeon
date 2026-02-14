<?php

namespace App\Http\Controllers;

use App\Models\Tontine;
use App\Models\TontineContribution;
use Illuminate\Http\Request;
use Laravel\Cashier\Cashier;

class StripeController extends Controller
{
    public function checkoutSuccess(Request $request)
    {
        $sessionId = $request->get('session_id');

        if ($sessionId === null) {
            return;
        }

        try {
            $session = Cashier::stripe()->checkout->sessions->retrieve($sessionId);
        } catch (\Exception $e) {
            return redirect()->route('tontines.index')->with('error', 'Something went wrong. Please try again.');
        }

        if ($session->payment_status !== 'paid') {
            return;
        }

        $tontineId = $session['metadata']['tontine_id'] ?? null;
        $userId = $session['metadata']['user_id'] ?? null;

        $tontine = Tontine::findOrFail($tontineId);

        TontineContribution::create([
            'tontine_member_id' => $tontine->members()->where('user_id', $userId)->first()->id,
            'amount' => $session->amount_total / 100,
            'status' => 'paid',
            'contribution_date' => now()
        ]);

        return inertia('Stripe/CheckoutSuccess', [
            "session" => $session,
        ]);
    }

    public function checkoutCancel()
    {
        return inertia('Stripe/CheckoutCancel');
    }
}
