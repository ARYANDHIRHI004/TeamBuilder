import RoleProtectedRoute from "./RoleProtectedRoute";
import AdminStudentsPage from "../app/admin/AdminStudentsPage";
import AdminAdminsPage from "../app/admin/AdminAdminsPage";
import AdminFeedbackPage from "../app/admin/AdminFeedbackPage";
import AdminSettingsPage from "../app/admin/AdminSettingsPage";
import Courses from "../app/courses/Courses";

const adminRouteElement = (
  <RoleProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]} />
);

const adminRoutes = [
  {
    element: adminRouteElement,
    children: [
      { path: "/admin/students", element: <AdminStudentsPage /> },
      { path: "/admin/admins", element: <AdminAdminsPage /> },
      { path: "/admin/courses", element: <Courses /> },
      { path: "/admin/feedback", element: <AdminFeedbackPage /> },
      { path: "/admin/settings", element: <AdminSettingsPage /> },
    ],
  },
];

export { adminRoutes };
