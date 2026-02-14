<?php

namespace App\Enums;

enum StatusEnums: string
{
    case SCHEDULED = 'scheduled';
    case COMPLETED = 'completed';
    case PENDING = 'pending';
    case ACCEPTED = 'accepted';
    case DECLINED = 'declined';
    case PAID = 'paid';
    case LATE = 'late';
    case EXPIRED = 'expired';
    case ACTIVE = 'active';
    case INACTIVE = 'inactive';
    case FULL = 'full';
    case CANCELLED = 'cancelled';
    case ON_HOLD = 'on_hold';
    case SUSPENDED = 'suspended';
    case CLOSED = 'closed';
}
