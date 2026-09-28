// import Dashboard from "../app/dashboard/Dashboard";
import Profile from "../app/profile/Profile";
import Teams from "../app/courses/Teams";
import Peers from "../app/courses/Peers";
import AdminDashboard from "@/components/AdminDashboard";

const dashboardRoutes = [
  // {
  //   path: "/",
  //   element: <Dashboard />,
  // },
  {
    path: "/dashboard",
    // element: <Dashboard />,
    element: <AdminDashboard onCreateCohort={()=>{return Promise.resolve()}} />,
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
];

export { dashboardRoutes };
