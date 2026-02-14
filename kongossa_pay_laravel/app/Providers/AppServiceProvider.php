<?php

namespace App\Providers;

use App\Models\Budget;
use App\Models\Tontine;
use App\Models\User;
use App\Policies\BudgetPolicy;
use App\Policies\TontinePolicy;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Laravel\Cashier\Cashier;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register model policies
        Gate::policy(Budget::class, BudgetPolicy::class);
        Gate::policy(Tontine::class, TontinePolicy::class);

        JsonResource::withoutWrapping();

        if (!app()->isProduction()) {
            \Rez1pro\ServicePattern\ServicePatternServiceProvider::class;
            \Rez1pro\UserAccess\UserAccessServiceProvider::class;
        }

        Cashier::useCustomerModel(User::class);
        Cashier::calculateTaxes();
    }
}
