<?php

use App\Http\Controllers\BudgetCategoryController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\StripeController;
use App\Http\Controllers\TontineContributionController;
use App\Http\Controllers\TontineController;
use App\Http\Controllers\TontineInviteController;
use App\Http\Controllers\TontineMemberController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return inertia('welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
})->name('home');

Route::middleware(['auth', 'verified', 'isActive'])->group(function () {
    // Dashboard
    Route::get('dashboard', [BudgetController::class, 'dashboard'])->middleware('check:manage:dashboard')->name('dashboard');

    // Budget Management Routes
    Route::prefix('budgets')->name('budgets.')->middleware("check:manage:budget")->group(function () {
        Route::get('/', [BudgetController::class, 'index'])->name('index');
        Route::get('/create', [BudgetController::class, 'create'])->name('create');
        Route::post('/', [BudgetController::class, 'store'])->name('store');
        Route::get('/{budget}', [BudgetController::class, 'show'])->name('show');
        Route::get('/{budget}/edit', [BudgetController::class, 'edit'])->name('edit');
        Route::put('/{budget}', [BudgetController::class, 'update'])->name('update');
        Route::delete('/{budget}', [BudgetController::class, 'destroy'])->name('destroy');
        Route::get('/{budget}/stats', [BudgetController::class, 'stats'])->name('stats');
        Route::get('/{budget}/summary', [BudgetController::class, 'summary'])->name('summary');

        // Budget Categories sub-routes
        Route::post('/{budget}/categories', [BudgetCategoryController::class, 'store'])->name('categories.store');
    });

    // Budget Categories Routes
    Route::prefix('budget-categories')->name('budget-categories.')->middleware("check:manage:budget")->group(function () {
        Route::get('/', [BudgetCategoryController::class, 'index'])->name('index');
        Route::post('/', [BudgetCategoryController::class, 'store'])->name('store');
        Route::get('/create', [BudgetCategoryController::class, 'create'])->name('create');
        Route::get('/{budgetCategory}', [BudgetCategoryController::class, 'show'])->name('show');
        Route::get('/{budgetCategory}/edit', [BudgetCategoryController::class, 'edit'])->name('edit');
        Route::put('/{budgetCategory}', [BudgetCategoryController::class, 'update'])->name('update');
        Route::delete('/{budgetCategory}', [BudgetCategoryController::class, 'destroy'])->name('destroy');
        Route::get('/{budgetCategory}/stats', [BudgetCategoryController::class, 'stats'])->name('stats');

        // Category Expenses sub-routes
        Route::post('/{budgetCategory}/expenses', [ExpenseController::class, 'store'])->name('expenses.store');
    });

    // Expenses Routes
    Route::prefix('expenses')->name('expenses.')->middleware("check:manage:budget")->group(function () {
        Route::get('/', [ExpenseController::class, 'index'])->name('index');
        Route::get('/create', [ExpenseController::class, 'create'])->name('create');
        Route::post('/', [ExpenseController::class, 'store'])->name('store');
        Route::get('/{expense}', [ExpenseController::class, 'show'])->name('show');
        Route::get('/{expense}/edit', [ExpenseController::class, 'edit'])->name('edit');
        Route::put('/{expense}', [ExpenseController::class, 'update'])->name('update');
        Route::delete('/{expense}', [ExpenseController::class, 'destroy'])->name('destroy');
        Route::get('/user/{user}', [ExpenseController::class, 'userExpenses'])->name('user');
        Route::get('/stats/user', [ExpenseController::class, 'stats'])->name('stats');
    });

    // Tontine Routes
    Route::prefix('tontines')->name('tontines.')->middleware("check:manage:tontine")->group(function () {
        Route::get('/', [TontineController::class, "index"])->name('index');
        Route::post('/', [TontineController::class, 'store'])->name('store');
        Route::get('/create', [TontineController::class, 'create'])->name('create');
        Route::get('/{tontine}', [TontineController::class, 'show'])->name('show')->whereNumber('tontine');
        Route::get('/{tontine}/edit', [TontineController::class, 'edit'])->name('edit')->whereNumber('tontine');
        Route::put('/{tontine}', [TontineController::class, 'update'])->name('update')->whereNumber('tontine');
        Route::delete('/{tontine}', [TontineController::class, 'destroy'])->name('destroy')->whereNumber('tontine');
        Route::get('/{tontine}/stats', [TontineController::class, 'stats'])->name('stats')->whereNumber('tontine');
        Route::get('/{tontine}/dashboard', [TontineController::class, 'dashboard'])->name('dashboard')->whereNumber('tontine');

        // Tontine sub-routes
        Route::post('/{tontine}/members', [TontineMemberController::class, 'store'])->name('members.store')->whereNumber('tontine');
        Route::post('/{tontine}/invites', [TontineInviteController::class, 'store'])->name('invites.store')->whereNumber('tontine');

        // tontine contribution
        Route::get('/{tontine}/contribute', [TontineContributionController::class, 'tontineContribute'])->name('contribute')->whereNumber('tontine');
    });

    // Tontine Members Routes
    Route::prefix('tontine-members')->name('tontine-members.')->middleware("check:manage:tontine")->group(function () {
        Route::get('/', [TontineMemberController::class, 'index'])->name('index');
        Route::get('/{tontineMember}', [TontineMemberController::class, 'show'])->name('show');
        Route::put('/{tontineMember}', [TontineMemberController::class, 'update'])->name('update');
        Route::delete('/{tontineMember}', [TontineMemberController::class, 'destroy'])->name('destroy');
        Route::get('/{tontineMember}/stats', [TontineMemberController::class, 'stats'])->name('stats');

        // Member Contributions sub-routes
        Route::post('/{tontineMember}/contributions', [TontineContributionController::class, 'store'])->name('contributions.store');
    });

    // Tontine Contributions Routes
    Route::prefix('tontine-contributions')->name('tontine-contributions.')->middleware("check:manage:tontine")->group(function () {
        Route::get('/', [TontineContributionController::class, 'index'])->name('index');
        Route::get('/{tontineContribution}', [TontineContributionController::class, 'show'])->name('show');
        Route::put('/{tontineContribution}', [TontineContributionController::class, 'update'])->name('update');
        Route::delete('/{tontineContribution}', [TontineContributionController::class, 'destroy'])->name('destroy');
        Route::patch('/{tontineContribution}/mark-paid', [TontineContributionController::class, 'markAsPaid'])->name('mark-paid');
        Route::patch('/{tontineContribution}/mark-late', [TontineContributionController::class, 'markAsLate'])->name('mark-late');
        Route::get('/tontine/{tontine}', [TontineContributionController::class, 'tontineContributions'])->name('tontine');
        Route::get('/stats/tontine/{tontine}', [TontineContributionController::class, 'stats'])->name('stats');
    });

    // Tontine Invites Routes
    Route::prefix('tontine-invites')->name('tontine-invites.')->middleware("check:manage:tontine")->group(function () {
        Route::get('/', [TontineInviteController::class, 'index'])->name('index');
        Route::get('/{tontineInvite}', [TontineInviteController::class, 'show'])->name('show');
        Route::patch('/{tontineInvite}/accept', [TontineInviteController::class, 'accept'])->name('accept');
        Route::patch('/{tontineInvite}/decline', [TontineInviteController::class, 'decline'])->name('decline');
        Route::post('/{tontineInvite}/resend', [TontineInviteController::class, 'resend'])->name('resend');
        Route::delete('/{tontineInvite}', [TontineInviteController::class, 'destroy'])->name('destroy');
    });

    // Analytics Routes
    // Route::get('/analytics', [AnalysicsController::class, 'index'])->name('analytics');

    // Contributions shortcut (user's contributions across all tontines)
    // Route::get('/contributions', [TontineContributionController::class, 'index'])->name('contributions');

    // Invitations shortcut (user's pending invitations)
    Route::get('/invitations', [TontineInviteController::class, 'index'])->name('invitations');

    // stripe callback
    Route::group(['prefix' => 'stripe', 'as' => 'stripe.', 'middleware' => 'check:manage:tontine'], function () {
        Route::get('checkout/success', [StripeController::class, 'checkoutSuccess'])->name('checkout-success');
        Route::get('checkout/cancel', [StripeController::class, 'checkoutCancel'])->name('checkout-cancel');
    });

    // manage users
    Route::group(['prefix' => 'users', 'as' => 'users.', 'middleware' => 'check:manage:user'], function () {
        Route::get('/', [UserController::class, 'index'])->name('index');
        Route::get('/create', [UserController::class, 'create'])->name('create');
        Route::post('/', [UserController::class, 'store'])->name('store');
        Route::get('/{user}', [UserController::class, 'show'])->name('show');
        Route::get('/{user}/edit', [UserController::class, 'edit'])->name('edit');
        Route::put('/{user}', [UserController::class, 'update'])->name('update');
        Route::delete('/{user}', [UserController::class, 'destroy'])->name('destroy');
        Route::get('/{user}/download-document', [UserController::class, 'downloadLegalFormDocument'])->name('download-document');
    });

    // Manage Permissions and Roles
    Route::resource('roles', RoleController::class)->except(['create', 'edit', 'show'])->middleware("check:manage:role");
});
// Public invite acceptance (doesn't require auth middleware)
Route::get('/invite/{token}', [TontineInviteController::class, 'getByToken'])->name('invite.token')->middleware('guest');

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
