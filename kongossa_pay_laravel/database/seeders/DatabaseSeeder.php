<?php

namespace Database\Seeders;

use App\Enums\Permissions\BudgetPermissionEnums;
use App\Enums\Permissions\TontinePermissionEnums;
use App\Models\Role;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Hash;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;
use Rez1pro\UserAccess\Facades\UserAccess;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = Role::create([
            'name' => 'Admin',
        ]);

        $user = Role::create([
            'name' => 'User',
        ]);

        // Create the main test user
        User::factory()->create([
            'name' => 'admin',
            'email' => 'admin@kongossapay.com',
            'password' => Hash::make('K0ng0ss@p@y#2O25'),
            'role_id' => $admin->id,
        ]);

        Artisan::call('permission:insert');

        $permissions = UserAccess::all();

        // giving all the permissions to the admin role
        foreach ($permissions as $permission) {
            $admin->givePermissionTo($permission);
        }

        // giving minimum permission to the user
        $user->givePermissionTo(TontinePermissionEnums::MANAGE_TONTINE);

        $user->givePermissionTo(BudgetPermissionEnums::MANAGE_BUDGET);

        // Create additional test users for the financial system
        User::factory(9)->create([
            'role_id' => $user->id,
        ]);
    }
}
