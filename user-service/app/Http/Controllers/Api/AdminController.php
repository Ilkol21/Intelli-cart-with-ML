<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateUserRoleRequest;
use App\Http\Requests\UpdateUserStatusRequest;
use App\Models\User;

class AdminController extends Controller
{
    public function stats()
    {
        return response()->json([
            'totalUsers' => User::count(),
        ]);
    }

    public function users()
    {
        $users = User::select('id', 'name', 'email', 'role', 'is_active', 'created_at')->get();
        return response()->json($users);
    }

    public function updateRole(UpdateUserRoleRequest $request, $id)
    {
        $user = User::findOrFail($id);
        $user->role = $request->role;
        $user->save();

        return response()->json($user->only(['id', 'name', 'email', 'role', 'is_active']));
    }

    public function updateStatus(UpdateUserStatusRequest $request, $id)
    {
        $user = User::findOrFail($id);
        $user->is_active = $request->is_active;
        $user->save();

        return response()->json($user->only(['id', 'name', 'email', 'role', 'is_active']));
    }
}
