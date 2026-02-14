<?php

namespace App\Enums\Permissions;

use Rez1pro\UserAccess\Traits\HasAccess;

enum SettingsPermissionEnums: string
{
    use HasAccess;

    case VIEW_SETTINGS = 'manage:settings';
}