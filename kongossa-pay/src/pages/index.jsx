import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/pages/Layout";
import { routes } from "@/routes/web";
import PageTransition from "@/components/animation/PageTransition";

export default function AppRouter() {
  const publicRoutes = routes.filter((r) => r.middleware?.includes("guest"));
  const protectedRoutes = routes.filter((r) => r.middleware?.includes("auth"));

  return (
    <BrowserRouter>
      <PageTransition>
        <Routes>
          {/* Public Pages */}
          <Route element={<Layout />}>
            {publicRoutes.map((route, i) => (
              <Route key={i} path={route.path} element={route.element} />
            ))}
          </Route>

          {/* Protected Pages */}
          <Route element={<Layout />}>
            {protectedRoutes.map((route, i) => (
              <Route key={i} path={route.path} element={route.element} />
            ))}
          </Route>

          {/* 404 */}
          <Route
            path="*"
            element={routes.find((r) => r.name === "NotFound")?.element}
          />
        </Routes>
      </PageTransition>
    </BrowserRouter>
  );
}
