<?php

namespace App\Enums;

enum TimePeriodEnums: int
{
    case WEEK_IN_DAYS = 7;
    case MONTH_IN_DAYS = 30;
    case YEAR_IN_DAYS = 365;
    case DAY_IN_HOURS = 24;
}
