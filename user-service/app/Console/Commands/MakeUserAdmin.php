<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class MakeUserAdmin extends Command
{
    protected $signature = 'app:make-admin {email}';
    protected $description = 'Assign the admin role to a user';

    public function handle()
    {
        $email = $this->argument('email');
        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("User with email '{$email}' not found.");
            return 1;
        }

        $user->role = 'admin';
        $user->save();

        $this->info("User '{$user->name}' ({$email}) is now an administrator.");
        return 0;
    }
}
