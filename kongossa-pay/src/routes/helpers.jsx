// src/routes/helpers.js
import { RequireAuth } from "@/routes/middleware/auth";
import { RequirePermission } from "@/routes/middleware/permission";

/**
 * Laravel-like route grouping
 * @param {Object} options
 * @param {string} [options.prefix]
 * @param {string[]} [options.middleware]
 * @param {string[]} [options.permissions]
 * @param {Array} routes
 */
export function group(options, routes) {
  const prefix = options.prefix || "";
  const middleware = options.middleware || [];
  const permissions = options.permissions || [];

  return routes.map((r) => ({
    ...r,
    path: prefix + r.path,
    middleware: [...(r.middleware || []), ...middleware],
    permissions: [...(r.permissions || []), ...permissions],
  }));
}

/**
 * Apply middleware HOCs
 */
export function applyMiddleware(route) {
  let element = route.element;

  if (route.middleware?.includes("auth")) {
    element = <RequireAuth>{element}</RequireAuth>;
  }

  if (route.middleware?.includes("permission")) {
    element = (
      <RequirePermission permissions={route.permissions || []}>
        {element}
      </RequirePermission>
    );
  }

  return { ...route, element };
}
