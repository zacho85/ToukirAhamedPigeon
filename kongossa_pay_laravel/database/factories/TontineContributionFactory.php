<?php

namespace Database\Factories;

use App\Enums\StatusEnums;
use App\Models\TontineContribution;
use App\Models\TontineMember;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TontineContribution>
 */
class TontineContributionFactory extends Factory
{
    protected $model = TontineContribution::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tontine_member_id' => TontineMember::factory(),
            'amount' => $this->faker->randomFloat(2, 50, 1000),
            'contribution_date' => $this->faker->dateTimeBetween('-3 months', 'now'),
            'status' => $this->faker->randomElement([
                StatusEnums::PENDING,
                StatusEnums::PENDING, // paid
                'late'
            ]),
        ];
    }

    /**
     * Create a paid contribution.
     */
    public function paid(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'paid',
            'contribution_date' => $this->faker->dateTimeBetween('-2 months', '-1 week'),
        ]);
    }

    /**
     * Create a pending contribution.
     */
    public function pending(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => StatusEnums::PENDING,
            'contribution_date' => $this->faker->dateTimeBetween('-1 week', '+1 week'),
        ]);
    }

    /**
     * Create a late contribution.
     */
    public function late(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'late',
            'contribution_date' => $this->faker->dateTimeBetween('-1 month', '-1 week'),
        ]);
    }

    /**
     * Create a recent contribution.
     */
    public function recent(): static
    {
        return $this->state(fn(array $attributes) => [
            'contribution_date' => $this->faker->dateTimeBetween('-7 days', 'now'),
        ]);
    }

    /**
     * Create a current month contribution.
     */
    public function currentMonth(): static
    {
        return $this->state(fn(array $attributes) => [
            'contribution_date' => $this->faker->dateTimeThisMonth(),
        ]);
    }

    /**
     * Create a contribution for a specific member.
     */
    public function forMember(TontineMember $member): static
    {
        return $this->state(fn(array $attributes) => [
            'tontine_member_id' => $member->id,
        ]);
    }

    /**
     * Create a contribution with specific amount.
     */
    public function withAmount(float $amount): static
    {
        return $this->state(fn(array $attributes) => [
            'amount' => $amount,
        ]);
    }
}
