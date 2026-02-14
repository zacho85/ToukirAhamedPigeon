<?php

namespace Database\Factories;

use App\Models\Tontine;
use App\Models\TontineMember;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TontineMember>
 */
class TontineMemberFactory extends Factory
{
    protected $model = TontineMember::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tontine_id' => Tontine::factory(),
            'user_id' => User::factory(),
            'priority_order' => $this->faker->numberBetween(1, 10),
            'is_admin' => false,
        ];
    }

    /**
     * Create an admin member.
     */
    public function admin(): static
    {
        return $this->state(fn(array $attributes) => [
            'is_admin' => true,
            'priority_order' => 1, // Admin usually gets first priority
        ]);
    }

    /**
     * Create a regular member.
     */
    public function regular(): static
    {
        return $this->state(fn(array $attributes) => [
            'is_admin' => false,
        ]);
    }

    /**
     * Set specific priority order.
     */
    public function withPriority(int $priority): static
    {
        return $this->state(fn(array $attributes) => [
            'priority_order' => $priority,
        ]);
    }

    /**
     * Create a member for a specific tontine.
     */
    public function forTontine(Tontine $tontine): static
    {
        return $this->state(fn(array $attributes) => [
            'tontine_id' => $tontine->id,
        ]);
    }

    /**
     * Create a member for a specific user.
     */
    public function forUser(User $user): static
    {
        return $this->state(fn(array $attributes) => [
            'user_id' => $user->id,
        ]);
    }
}
