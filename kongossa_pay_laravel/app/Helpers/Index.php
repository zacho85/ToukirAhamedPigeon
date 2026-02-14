<?php

use Illuminate\Routing\Controllers\Middleware;

function checkPermission(BackedEnum $permission, $only = [], $except = [])
{
    return new Middleware('check:' . $permission->value, only: $only, except: $except);
}