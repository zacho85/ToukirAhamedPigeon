<?php

namespace App\Enums\Permissions;

use Rez1pro\UserAccess\Traits\HasAccess;

enum BudgetPermissionEnums: string
{
    use HasAccess;

    case MANAGE_BUDGET = 'manage:budget';
    case MANAGE_DASHBOARD = 'manage:dashboard';
}