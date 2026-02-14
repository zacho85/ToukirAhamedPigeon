<?php

namespace Database\Factories;

use App\Models\Budget;
use App\Models\BudgetCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BudgetCategory>
 */
class BudgetCategoryFactory extends Factory
{
    protected $model = BudgetCategory::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = [
            ['name' => 'Food & Dining', 'color' => '#FF6B6B'],
            ['name' => 'Transportation', 'color' => '#4ECDC4'],
            ['name' => 'Entertainment', 'color' => '#45B7D1'],
            ['name' => 'Shopping', 'color' => '#96CEB4'],
            ['name' => 'Bills & Utilities', 'color' => '#FFEAA7'],
            ['name' => 'Healthcare', 'color' => '#DDA0DD'],
            ['name' => 'Education', 'color' => '#98D8C8'],
            ['name' => 'Travel', 'color' => '#F7DC6F'],
            ['name' => 'Rent/Mortgage', 'color' => '#BB8FCE'],
            ['name' => 'Savings', 'color' => '#85C1E9'],
        ];

        $category = $this->faker->randomElement($categories);

        return [
            'budget_id' => Budget::factory(),
            'name' => $category['name'],
            'color' => $category['color'],
            'limit_amount' => $this->faker->randomFloat(2, 50, 1000),
        ];
    }

    /**
     * Create a food category.
     */
    public function food(): static
    {
        return $this->state(fn(array $attributes) => [
            'name' => 'Food & Dining',
            'color' => '#FF6B6B',
            'limit_amount' => $this->faker->randomFloat(2, 200, 800),
        ]);
    }

    /**
     * Create a transportation category.
     */
    public function transportation(): static
    {
        return $this->state(fn(array $attributes) => [
            'name' => 'Transportation',
            'color' => '#4ECDC4',
            'limit_amount' => $this->faker->randomFloat(2, 100, 500),
        ]);
    }

    /**
     * Create an entertainment category.
     */
    public function entertainment(): static
    {
        return $this->state(fn(array $attributes) => [
            'name' => 'Entertainment',
            'color' => '#45B7D1',
            'limit_amount' => $this->faker->randomFloat(2, 50, 300),
        ]);
    }
}
