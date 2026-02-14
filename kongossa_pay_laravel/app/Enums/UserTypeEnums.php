<?php

namespace App\Enums;

use Rez1pro\UserAccess\Traits\HasAccess;

enum UserTypeEnums: string
{
    use HasAccess;
    case PERSONAL = 'personal';
    case BUSINESS = 'business_merchant';
}
