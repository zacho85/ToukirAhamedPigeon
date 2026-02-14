<?php

namespace Database\Factories;

use App\Enums\StatusEnums;
use App\Models\Tontine;
use App\Models\TontineInvite;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TontineInvite>
 */
class TontineInviteFactory extends Factory
{
    protected $model = TontineInvite::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tontine_id' => Tontine::factory(),
            'email' => $this->faker->unique()->safeEmail(),
            'invite_token' => Str::random(32),
            'status' => $this->faker->randomElement([
                StatusEnums::PENDING,
                StatusEnums::ACCEPTED,
                StatusEnums::DECLINED
            ]),
        ];
    }

    /**
     * Create a pending invite.
     */
    public function pending(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => StatusEnums::PENDING,
        ]);
    }

    /**
     * Create an accepted invite.
     */
    public function accepted(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => StatusEnums::ACCEPTED,
        ]);
    }

    /**
     * Create a declined invite.
     */
    public function declined(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => StatusEnums::DECLINED,
        ]);
    }

    /**
     * Create an expired invite (older than 7 days).
     */
    public function expired(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => StatusEnums::PENDING,
            'created_at' => $this->faker->dateTimeBetween('-30 days', '-8 days'),
        ]);
    }

    /**
     * Create a recent invite.
     */
    public function recent(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => StatusEnums::PENDING,
            'created_at' => $this->faker->dateTimeBetween('-3 days', 'now'),
        ]);
    }

    /**
     * Create an invite for a specific tontine.
     */
    public function forTontine(Tontine $tontine): static
    {
        return $this->state(fn(array $attributes) => [
            'tontine_id' => $tontine->id,
        ]);
    }

    /**
     * Create an invite with a specific email.
     */
    public function withEmail(string $email): static
    {
        return $this->state(fn(array $attributes) => [
            'email' => $email,
        ]);
    }
}
