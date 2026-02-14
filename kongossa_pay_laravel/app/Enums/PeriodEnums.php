<?php

namespace App\Enums;

enum PeriodEnums: string
{
    case WEEKLY = 'weekly';
    case MONTHLY = 'monthly';
    case YEARLY = 'yearly';
    case DAILY = 'daily';
}
