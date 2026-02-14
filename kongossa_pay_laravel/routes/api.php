<?php

use App\Http\Controllers\BudgetCategoryController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\TontineController;
use App\Http\Controllers\TontineContributionController;
use App\Http\Controllers\TontineInviteController;
use App\Http\Controllers\TontineMemberController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
