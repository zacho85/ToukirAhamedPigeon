<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermissionMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission)
    {
        $hasPermission = $request->user()->role->hasPermissionTo($permission);

        if ($hasPermission) {
            return $next($request);
        }

        return abort(403, 'You Don\'t have the right permission to access this page');
    }
}
