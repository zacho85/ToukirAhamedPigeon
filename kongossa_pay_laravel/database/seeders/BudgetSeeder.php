<?php

namespace Database\Seeders;

use App\Models\Budget;
use App\Models\BudgetCategory;
use App\Models\Expense;
use App\Models\User;
use Illuminate\Database\Seeder;

class BudgetSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all users or create some if they don't exist
        $users = User::all();

        if ($users->isEmpty()) {
            $users = User::factory(5)->create();
        }

        foreach ($users as $user) {
            // Create 2-3 budgets per user
            $budgets = Budget::factory(rand(2, 3))
                ->for($user)
                ->create();

            foreach ($budgets as $budget) {
                // Create 3-5 categories per budget
                $categories = BudgetCategory::factory(rand(3, 5))
                    ->for($budget)
                    ->create([
                        'limit_amount' => function () use ($budget) {
                            // Ensure categories don't exceed total budget
                            return rand(50, $budget->total_amount / 4);
                        }
                    ]);

                foreach ($categories as $category) {
                    // Create 5-15 expenses per category
                    Expense::factory(rand(5, 15))
                        ->for($category, 'budgetCategory')
                        ->create([
                            'amount' => function () use ($category) {
                                // Keep expenses within category limits
                                return rand(5, min(100, $category->limit_amount / 3));
                            }
                        ]);
                }
            }
        }
    }
}
