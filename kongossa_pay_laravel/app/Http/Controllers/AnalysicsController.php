<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class AnalysicsController extends Controller
{
    function index()
    {
        $analytics = [
            'period' => request('period', '30_days'),
            'budget_analytics' => [
                'total_allocated' => 0,
                'total_spent' => 0,
                'savings_rate' => 0.00,
                'categories' => [
                    [
                        'name' => 'Food & Dining',
                        'color' => '#ef4444',
                        'allocated' => 0,
                        'spent' => 0,
                        'percentage' => 0.00
                    ],
                    [
                        'name' => 'Transportation',
                        'color' => '#3b82f6',
                        'allocated' => 0,
                        'spent' => 0,
                        'percentage' => 0.00
                    ],
                    [
                        'name' => 'Entertainment',
                        'color' => '#8b5cf6',
                        'allocated' => 0,
                        'spent' => 0,
                        'percentage' => 0.00
                    ]
                ],
                'spending_trend' => [
                    ['period' => 'January', 'amount' => 0],
                    ['period' => 'February', 'amount' => 0],
                    ['period' => 'March', 'amount' => 0]
                ]
            ],
            'tontine_analytics' => [
                'total_contributed' => 0,
                'total_received' => 0,
                'net_flow' => -0,
                'active_tontines' => 0,
                'contribution_rate' => 0,
                'tontines' => [
                    [
                        'name' => 'Family Emergency Fund',
                        'type' => 'family',
                        'contributed' => 0,
                        'received' => 0,
                        'roi' => -00.0
                    ],
                    [
                        'name' => 'Investment Group',
                        'type' => 'investment',
                        'contributed' => 0,
                        'received' => 0,
                        'roi' => -0.00
                    ]
                ]
            ],
            'financial_health' => [
                'score' => 0,
                'grade' => 'B',
                'recommendations' => [
                    'Consider increasing your emergency fund to 6 months of expenses',
                    'Diversify your tontine portfolio with different risk levels',
                    'Track your spending more consistently in the Entertainment category'
                ]
            ]
        ];

        return Inertia::render('Analytics', compact('analytics'));
    }
}
