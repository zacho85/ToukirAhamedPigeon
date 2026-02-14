<?php

namespace App\Enums\Permissions;

use Rez1pro\UserAccess\Traits\HasAccess;

enum RolePermissionEnums: string
{
    use HasAccess;

    // Role permission cases
    case MANAGE_ROLE = 'manage:role';
}