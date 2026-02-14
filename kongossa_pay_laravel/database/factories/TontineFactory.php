<?php

namespace Database\Factories;

use App\Enums\FrequencyEnums;
use App\Models\Tontine;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Tontine>
 */
class TontineFactory extends Factory
{
    protected $model = Tontine::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $tontineNames = [
            'Family Savings Circle',
            'Friends Investment Group',
            'Monthly Savers',
            'Weekly Contributors',
            'Holiday Fund',
            'Emergency Fund Group',
            'Business Partners Circle',
            'Neighborhood Savings',
            'College Friends Fund',
            'Travel Savings Group'
        ];

        return [
            'created_by' => User::factory(),
            'name' => $this->faker->randomElement($tontineNames),
            'type' => $this->faker->randomElement(['friends', 'family', 'savings', 'investment']),
            'contribution_amount' => $this->faker->randomFloat(2, 50, 1000),
            'frequency' => $this->faker->randomElement(FrequencyEnums::cases()),
            'duration_months' => $this->faker->numberBetween(6, 24),
        ];
    }

    /**
     * Create a family tontine.
     */
    public function family(): static
    {
        return $this->state(fn(array $attributes) => [
            'type' => 'family',
            'name' => $this->faker->randomElement([
                'Family Savings Circle',
                'Extended Family Fund',
                'Family Emergency Fund',
                'Family Investment Group'
            ]),
            'contribution_amount' => $this->faker->randomFloat(2, 100, 500),
        ]);
    }

    /**
     * Create a friends tontine.
     */
    public function friends(): static
    {
        return $this->state(fn(array $attributes) => [
            'type' => 'friends',
            'name' => $this->faker->randomElement([
                'Friends Savings Group',
                'College Friends Fund',
                'Best Friends Circle',
                'Weekend Warriors Fund'
            ]),
            'contribution_amount' => $this->faker->randomFloat(2, 50, 300),
        ]);
    }

    /**
     * Create a savings tontine.
     */
    public function savings(): static
    {
        return $this->state(fn(array $attributes) => [
            'type' => 'savings',
            'name' => $this->faker->randomElement([
                'Monthly Savers',
                'Goal Achievers',
                'Future Fund',
                'Dream Savers'
            ]),
            'contribution_amount' => $this->faker->randomFloat(2, 100, 800),
        ]);
    }

    /**
     * Create an investment tontine.
     */
    public function investment(): static
    {
        return $this->state(fn(array $attributes) => [
            'type' => 'investment',
            'name' => $this->faker->randomElement([
                'Investment Partners',
                'Business Growth Fund',
                'Wealth Builders',
                'Smart Investors'
            ]),
            'contribution_amount' => $this->faker->randomFloat(2, 200, 1000),
            'duration_months' => $this->faker->numberBetween(12, 36),
        ]);
    }

    /**
     * Create a monthly tontine.
     */
    public function monthly(): static
    {
        return $this->state(fn(array $attributes) => [
            'frequency' => FrequencyEnums::MONTHLY,
        ]);
    }

    /**
     * Create a weekly tontine.
     */
    public function weekly(): static
    {
        return $this->state(fn(array $attributes) => [
            'frequency' => FrequencyEnums::WEEKLY,
            'contribution_amount' => $this->faker->randomFloat(2, 25, 200),
        ]);
    }
}
