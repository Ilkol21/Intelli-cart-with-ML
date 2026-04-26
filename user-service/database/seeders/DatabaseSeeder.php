<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@intelli-cart.com'],
            [
                'name'      => 'Admin',
                'password'  => \Illuminate\Support\Facades\Hash::make('admin123'),
                'role'      => 'admin',
                'is_active' => true,
            ]
        );
    }
}
