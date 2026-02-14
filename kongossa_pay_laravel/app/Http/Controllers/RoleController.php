<?php

namespace App\Http\Controllers;

use App\Enums\Permissions\RolePermissionEnums;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Rez1pro\UserAccess\Facades\UserAccess;

class RoleController extends Controller
{
    // public static function middleware(): array
    // {
    //     return [
    //         checkPermission(RolePermissionEnums::VIEW_ROLE, only: ['index', 'show']),
    //         checkPermission(RolePermissionEnums::CREATE_ROLE, only: ['create', 'store']),
    //         checkPermission(RolePermissionEnums::UPDATE_ROLE, only: ['edit', 'update']),
    //         checkPermission(RolePermissionEnums::DELETE_ROLE, only: ['destroy']),
    //     ];
    // }
    function index()
    {

        $roles = Role::query()->with('permissions')->select(['name', 'id'])
            ->addSelect([
                'total_users' => function ($query) {
                    $query->selectRaw('COUNT(*)')
                        ->from('users')
                        ->whereColumn('role_id', 'roles.id');
                }
            ])
            ->paginate();

        return inertia('Role/RoleList', [
            'roles' => $roles,
            'permissions' => UserAccess::all()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name'],
            'permissions' => ['required', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $role = Role::create($validated);

        foreach ($validated['permissions'] as $permission) {
            $role->givePermissionTo($permission);
        }

        return redirect()->route('roles.index')->with('success', 'Role created successfully.');
    }

    function update(Request $request, Role $role)
    {
        if ($role->id == 1) {
            return redirect()->route('roles.index')->withErrors(['error' => 'Default role cannot be modified.']);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name,' . $role->id],
            'permissions' => ['required', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $role->update($validated);

        $pIds = Permission::query()->whereIn('name', $validated['permissions'])->pluck('id');

        $role->permissions()->sync($pIds);

        return redirect()->route('roles.index')->with('success', 'Role updated successfully.');
    }

    function destroy(Role $role)
    {
        if ($role->id == 1) {
            return redirect()->route('roles.index')->withErrors(['error' => 'Default role cannot be deleted.']);
        }

        if ($role->users()->count() > 0) {
            return redirect()->route('roles.index')->withErrors(['error' => 'Role cannot be deleted because it is assigned to users.']);
        }

        $role->delete();

        return redirect()->route('roles.index')->with('success', 'Role deleted successfully.');
    }
}
