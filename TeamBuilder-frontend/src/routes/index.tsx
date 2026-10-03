import { createBrowserRouter, Navigate } from "react-router-dom";
import { authRoutes } from "./AuthRoutes";
import ProtectedRoutes from "./ProtectedRoutes";
import Layout from "../app/Layout";
import { dashboardRoutes } from "./DashboardRoutes";
import { courseRoutes } from "./CoursesRoutes";
import { adminRoutes } from "./AdminRoutes";
import PublicRoutes from "./PublicRoute";
import Unauthorized from "@/pages/Unauthorized";

const router = createBrowserRouter([
  // ── Public routes (login, register, welcome, etc.) ─────────────────────
  {
    element: <PublicRoutes />,
    children: [...authRoutes],
  },

  // ── Protected routes (must be authenticated) ───────────────────────────
  {
    element: <ProtectedRoutes />,
    children: [
      {
        element: <Layout />,
        children: [
          // Shared routes: accessible to ALL logged-in users (admin + students)
          ...dashboardRoutes,
          ...courseRoutes,
          ...adminRoutes,
        ],
      },
    ],
  },

  // ── Unauthorized (access denied) page ─────────────────────────────────
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },

  // ── Catch-all redirect ─────────────────────────────────────────────────
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);

export default router;
