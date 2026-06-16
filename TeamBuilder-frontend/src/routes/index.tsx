import { createBrowserRouter} from "react-router-dom";
import { authRoutes } from "./AuthRoutes";
import ProtectedRoutes from "./ProtectedRoutes";
import Layout from "../app/Layout";
import { dashboardRoutes } from "./DashboardRoutes";
import { courseRoutes } from "./CoursesRoutes";
import CourseLayout from "../app/courses/CourseLayout";
import PublicRoutes from "./publicRoute";

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
        children: [
          ...dashboardRoutes,
          {
            element: <CourseLayout />,
            children: [...courseRoutes],
          },
        ],
      },
    ],
  },
]);

export default router;
