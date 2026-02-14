<?php

namespace Database\Seeders;

use App\Models\Tontine;
use App\Models\TontineContribution;
use App\Models\TontineInvite;
use App\Models\TontineMember;
use App\Models\TontinePayout;
use App\Models\User;
use Illuminate\Database\Seeder;

class TontineSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all users or create some if they don't exist
        $users = User::all();

        if ($users->isEmpty()) {
            $users = User::factory(10)->create();
        }

        // Create 5-8 tontines
        $tontines = Tontine::factory(rand(5, 8))
            ->create([
                'created_by' => $users->random()->id
            ]);

        foreach ($tontines as $tontine) {
            // Add the creator as an admin member
            $creator = TontineMember::factory()
                ->admin()
                ->withPriority(1)
                ->create([
                    'tontine_id' => $tontine->id,
                    'user_id' => $tontine->created_by,
                ]);

            // Add 3-7 other members
            $memberCount = rand(3, 7);
            $availableUsers = $users->where('id', '!=', $tontine->created_by)->shuffle();

            for ($i = 0; $i < min($memberCount, $availableUsers->count()); $i++) {
                $member = TontineMember::factory()
                    ->withPriority($i + 2) // Start from 2 since creator has priority 1
                    ->create([
                        'tontine_id' => $tontine->id,
                        'user_id' => $availableUsers[$i]->id,
                    ]);

                // Create contributions for each member
                TontineContribution::factory(rand(2, 8))
                    ->forMember($member)
                    ->withAmount($tontine->contribution_amount)
                    ->create();

                // 30% chance of having a payout
                if (rand(1, 100) <= 30) {
                    TontinePayout::factory()
                        ->forMember($member)
                        ->withAmount($tontine->expected_total)
                        ->create();
                }
            }

            // Create some pending invites
            TontineInvite::factory(rand(1, 3))
                ->forTontine($tontine)
                ->pending()
                ->create();

            // Create some accepted/declined invites
            TontineInvite::factory(rand(1, 2))
                ->forTontine($tontine)
                ->create();
        }
    }
}
