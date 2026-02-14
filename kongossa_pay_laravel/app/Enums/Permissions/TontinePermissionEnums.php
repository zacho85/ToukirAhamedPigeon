<?php

namespace App\Enums\Permissions;

use Rez1pro\UserAccess\Traits\HasAccess;

enum TontinePermissionEnums: string
{
    use HasAccess;

    case MANAGE_TONTINE = 'manage:tontine';
}