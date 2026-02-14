<?php

namespace Database\Factories;

use App\Models\BudgetCategory;
use App\Models\Expense;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Expense>
 */
class ExpenseFactory extends Factory
{
    protected $model = Expense::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $expenseTypes = [
            'Grocery Shopping',
            'Gas Station',
            'Restaurant',
            'Coffee Shop',
            'Public Transport',
            'Uber/Taxi',
            'Movie Tickets',
            'Clothing',
            'Pharmacy',
            'Gym Membership',
            'Rent Payment',
            'Electricity Bill',
            'Internet Bill',
            'Phone Bill',
            'Insurance',
            'Book Purchase',
            'Hospital Visit',
            'Car Maintenance',
            'Hair Salon',
            'Online Shopping'
        ];

        return [
            'budget_category_id' => BudgetCategory::factory(),
            'title' => $this->faker->randomElement($expenseTypes),
            'amount' => $this->faker->randomFloat(2, 5, 500),
            'expense_date' => $this->faker->dateTimeBetween('-30 days', 'now'),
        ];
    }

    /**
     * Create a recent expense (within last 7 days).
     */
    public function recent(): static
    {
        return $this->state(fn(array $attributes) => [
            'expense_date' => $this->faker->dateTimeBetween('-7 days', 'now'),
        ]);
    }

    /**
     * Create a small expense.
     */
    public function small(): static
    {
        return $this->state(fn(array $attributes) => [
            'amount' => $this->faker->randomFloat(2, 5, 50),
            'title' => $this->faker->randomElement([
                'Coffee',
                'Snack',
                'Parking',
                'Bus Fare',
                'Newspaper'
            ]),
        ]);
    }

    /**
     * Create a large expense.
     */
    public function large(): static
    {
        return $this->state(fn(array $attributes) => [
            'amount' => $this->faker->randomFloat(2, 200, 1000),
            'title' => $this->faker->randomElement([
                'Rent Payment',
                'Car Payment',
                'Insurance Premium',
                'Medical Bill',
                'Appliance Purchase'
            ]),
        ]);
    }

    /**
     * Create a food-related expense.
     */
    public function food(): static
    {
        return $this->state(fn(array $attributes) => [
            'title' => $this->faker->randomElement([
                'Grocery Shopping',
                'Restaurant Dinner',
                'Fast Food',
                'Coffee Shop',
                'Bakery',
                'Food Delivery'
            ]),
            'amount' => $this->faker->randomFloat(2, 10, 150),
        ]);
    }
}
