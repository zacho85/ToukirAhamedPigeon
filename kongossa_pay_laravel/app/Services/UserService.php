<?php

namespace App\Services;

use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class UserService
{
    function __construct()
    {

    }

    function getUsers()
    {
        return UserResource::collection(
            QueryBuilder::for(User::class)
                ->allowedFilters([
                    AllowedFilter::callback('search', function ($query, $value) {
                        $query->where(function ($query) use ($value) {
                            $query->where('name', 'LIKE', "%{$value}%")
                                ->orWhere('email', 'LIKE', "%{$value}%")
                                ->orWhere('phone', 'LIKE', "%{$value}%")
                                ->orWhere('company_name', 'LIKE', "%{$value}%");
                        });
                    })
                ])
                ->orderBy('id', 'desc')
                ->paginate(10)
        );
    }

    function getTotalUsers($status = null): int
    {
        return User::when($status, fn($query) => $query->where('status', $status))->count();
    }

    function getTotalRoles(): int
    {
        return Role::count();
    }

    function createUser(array $data): User
    {
        // Handle file upload if present
        if (isset($data['legal_form_document']) && $data['legal_form_document'] instanceof UploadedFile) {
            $data['legal_form_document'] = $this->storeLegalFormDocument($data['legal_form_document']);
        }

        // Hash password if present
        if (isset($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        }

        return User::create($data);
    }

    function updateUser(User $user, array $data): User
    {
        // Handle file upload if present
        if (isset($data['legal_form_document']) && $data['legal_form_document'] instanceof UploadedFile) {
            // Delete old file if exists
            if ($user->legal_form_document) {
                $this->deleteLegalFormDocument($user->legal_form_document);
            }
            $data['legal_form_document'] = $this->storeLegalFormDocument($data['legal_form_document']);
        }

        // Hash password if present
        if (isset($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        }

        $user->update($data);
        return $user->fresh();
    }

    function deleteUser(User $user): bool
    {
        // Delete associated files
        if ($user->legal_form_document) {
            $this->deleteLegalFormDocument($user->legal_form_document);
        }

        return $user->delete();
    }

    private function storeLegalFormDocument(UploadedFile $file): string
    {
        $filename = 'legal_form_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('legal_form_documents', $filename, 'public');
        return $path;
    }

    private function deleteLegalFormDocument(string $path): bool
    {
        if (Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->delete($path);
        }
        return false;
    }

    function getLegalFormDocumentUrl(string $path): string
    {
        return asset('storage/' . $path);
    }
}
