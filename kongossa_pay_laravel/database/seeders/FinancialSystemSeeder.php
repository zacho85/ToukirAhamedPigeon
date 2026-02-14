<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class FinancialSystemSeeder extends Seeder
{
    /**
     * Run the database seeds for the entire financial system.
     */
    public function run(): void
    {
        $this->call([
            BudgetSeeder::class,
            TontineSeeder::class,
        ]);
    }
}
