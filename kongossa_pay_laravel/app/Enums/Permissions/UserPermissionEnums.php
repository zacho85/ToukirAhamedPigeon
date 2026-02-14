<?php

namespace App\Enums\Permissions;

use Rez1pro\UserAccess\Traits\HasAccess;

enum UserPermissionEnums: string
{
    use HasAccess;

    case MANAGE_USER = 'manage:user';
}