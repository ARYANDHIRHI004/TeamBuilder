import { Navigate, Route, Routes } from "react-router-dom";
import Login from "../pages/Login";
import Welcome from "../pages/Welcome";
import Dashboard from "../app/dashboard/Dashboard";

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
