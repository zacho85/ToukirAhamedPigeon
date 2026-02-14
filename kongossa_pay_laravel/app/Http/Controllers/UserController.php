<?php

namespace App\Http\Controllers;

use App\Enums\Permissions\UserPermissionEnums;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    // public static function middleware(): array
    // {
    //     return [
    //         checkPermission(UserPermissionEnums::VIEW_USER, only: ['index', 'show']),
    //         checkPermission(UserPermissionEnums::UPDATE_STATUS, only: ['update', 'edit']),
    //     ];
    // }
    function __construct(
        protected UserService $userService
    ) {

    }

    function index()
    {
        return inertia('User/UserList', [
            'users' => $this->userService->getUsers(),
            'roles' => Role::select('id', 'name')->get(),
            'stats' => [
                'total_users' => $this->userService->getTotalUsers(),
                'active_users' => $this->userService->getTotalUsers('active'),
                'inactive_users' => $this->userService->getTotalUsers('inactive'),
                'total_roles' => $this->userService->getTotalRoles(),
            ]
        ]);
    }

    function create()
    {
        return inertia('User/UserCreate', [
            'roles' => Role::select('id', 'name')->get(),
        ]);
    }

    function store(StoreUserRequest $request)
    {
        $user = $this->userService->createUser($request->validated());

        return redirect()->route('users.index')->with('success', 'User created successfully.');
    }

    function show(User $user)
    {
        $user->load(['createdTontines', 'tontineMembers.tontine']);
        return inertia('User/UserShow', [
            'user' => new UserResource($user->load('createdTontines', 'tontineMembers.tontine'))
        ]);
    }

    function edit(User $user)
    {
        return inertia('User/UserEdit', [
            'user' => new UserResource($user),
            'roles' => Role::select('id', 'name')->get(),
        ]);
    }

    function update(UpdateUserRequest $request, User $user)
    {
        $data = $request->validated();

        // Handle role update separately for admin functionality
        if (isset($data['role'])) {
            if ($user->id === 1) {
                throw ValidationException::withMessages([
                    'role' => 'You cannot change the role of the default admin user.',
                ]);
            }

            $role = Role::where('name', $data['role'])->first();
            if ($role) {
                $data['role_id'] = $role->id;
            }
            unset($data['role']);
        }

        // Handle status update
        if (isset($data['status'])) {
            if ($user->id === auth()->id()) {
                throw ValidationException::withMessages([
                    'status' => 'You cannot change your own status.',
                ]);
            }
        }

        $this->userService->updateUser($user, $data);

        return redirect()->route('users.index')->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()->route('users.index')->withErrors(['error' => 'You cannot delete your own account.']);
        }

        if ($user->id === 1) {
            return redirect()->route('users.index')->withErrors(['error' => 'The default admin user cannot be deleted.']);
        }

        // check is there any tontines
        if ($user->createdTontines()->exists() || $user->tontineMembers()->exists() || $user->budgets()->exists()) {
            return redirect()->route('users.index')->withErrors(['error' => 'User has associated tontines and cannot be deleted.']);
        }

        $this->userService->deleteUser($user);

        return redirect()->route('users.index')->with('success', 'User deleted successfully.');
    }

    public function downloadLegalFormDocument(User $user)
    {
        if (!$user->legal_form_document) {
            abort(404, 'Document not found');
        }

        $url = $this->userService->getLegalFormDocumentUrl($user->legal_form_document);
        return redirect($url);
    }
}
