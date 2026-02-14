<?php

namespace Database\Factories;

use App\Enums\StatusEnums;
use App\Models\TontineMember;
use App\Models\TontinePayout;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TontinePayout>
 */
class TontinePayoutFactory extends Factory
{
    protected $model = TontinePayout::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tontine_member_id' => TontineMember::factory(),
            'amount' => $this->faker->randomFloat(2, 500, 5000),
            'payout_date' => $this->faker->dateTimeBetween('-1 month', '+3 months'),
            'status' => $this->faker->randomElement([
                StatusEnums::SCHEDULED,
                StatusEnums::COMPLETED
            ]),
        ];
    }

    /**
     * Create a scheduled payout.
     */
    public function scheduled(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => StatusEnums::SCHEDULED,
            'payout_date' => $this->faker->dateTimeBetween('now', '+6 months'),
        ]);
    }

    /**
     * Create a completed payout.
     */
    public function completed(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => StatusEnums::COMPLETED,
            'payout_date' => $this->faker->dateTimeBetween('-3 months', '-1 week'),
        ]);
    }

    /**
     * Create an upcoming payout.
     */
    public function upcoming(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => StatusEnums::SCHEDULED,
            'payout_date' => $this->faker->dateTimeBetween('+1 week', '+1 month'),
        ]);
    }

    /**
     * Create a due payout (today).
     */
    public function due(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => StatusEnums::SCHEDULED,
            'payout_date' => now()->toDateString(),
        ]);
    }

    /**
     * Create an overdue payout.
     */
    public function overdue(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => StatusEnums::SCHEDULED,
            'payout_date' => $this->faker->dateTimeBetween('-2 weeks', '-1 day'),
        ]);
    }

    /**
     * Create a payout for a specific member.
     */
    public function forMember(TontineMember $member): static
    {
        return $this->state(fn(array $attributes) => [
            'tontine_member_id' => $member->id,
        ]);
    }

    /**
     * Create a payout with specific amount.
     */
    public function withAmount(float $amount): static
    {
        return $this->state(fn(array $attributes) => [
            'amount' => $amount,
        ]);
    }
}
