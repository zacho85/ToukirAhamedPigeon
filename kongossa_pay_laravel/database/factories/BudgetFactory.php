<?php

namespace Database\Factories;

use App\Enums\PeriodEnums;
use App\Models\Budget;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Budget>
 */
class BudgetFactory extends Factory
{
    protected $model = Budget::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => $this->faker->randomElement([
                'Monthly Budget',
                'Weekly Expenses',
                'Travel Budget',
                'Emergency Fund',
                'Yearly Savings',
                'Holiday Budget',
                'Food Budget',
                'Entertainment Budget'
            ]),
            'period' => $this->faker->randomElement(PeriodEnums::cases()),
            'total_amount' => $this->faker->randomFloat(2, 100, 5000),
        ];
    }

    /**
     * Create a monthly budget.
     */
    public function monthly(): static
    {
        return $this->state(fn(array $attributes) => [
            'period' => PeriodEnums::MONTHLY,
            'total_amount' => $this->faker->randomFloat(2, 500, 3000),
        ]);
    }

    /**
     * Create a weekly budget.
     */
    public function weekly(): static
    {
        return $this->state(fn(array $attributes) => [
            'period' => PeriodEnums::WEEKLY,
            'total_amount' => $this->faker->randomFloat(2, 100, 800),
        ]);
    }

    /**
     * Create a yearly budget.
     */
    public function yearly(): static
    {
        return $this->state(fn(array $attributes) => [
            'period' => PeriodEnums::YEARLY,
            'total_amount' => $this->faker->randomFloat(2, 5000, 50000),
        ]);
    }
}
