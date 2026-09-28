import { createBrowserRouter } from "react-router-dom";
import { authRoutes } from "./AuthRoutes";
import ProtectedRoutes from "./ProtectedRoutes";
import Layout from "../app/Layout";
import { dashboardRoutes } from "./DashboardRoutes";
import { courseRoutes } from "./CoursesRoutes";
<<<<<<< HEAD
import PublicRoutes from "./PublicRoute";
=======
import PublicRoutes from "./publicRoute";
>>>>>>> 6245d4224e7fffcc0f4aa729bd3a27afe6682704

const router = createBrowserRouter([
  {
    element: <PublicRoutes />,
    children: [...authRoutes],
  },
  {
    element: <ProtectedRoutes />,
    children: [
      {
        element: <Layout />,
        children: [...dashboardRoutes, ...courseRoutes],
      },
    ],
  },
]);

export default router;
