import Login from "../pages/Login";
import Welcome from "../pages/Welcome";

const authRoutes = [
  {
    path: "/",
    element: <Welcome />,
  },
  {
    path: "/login",
    element: <Login />,
  },
];

export { authRoutes };
