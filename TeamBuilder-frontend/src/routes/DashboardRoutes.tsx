import Dashboard from "../app/dashboard/Dashboard";
import Profile from "../app/profile/Profile";
import Teams from "../app/courses/Teams";
import Peers from "../app/courses/Peers";

const dashboardRoutes = [
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/teams",
    element: <Teams />,
  },
  {
    path: "/peers",
    element: <Peers />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/profile/:userId",
    element: <Profile />,
  },
];

export { dashboardRoutes };
