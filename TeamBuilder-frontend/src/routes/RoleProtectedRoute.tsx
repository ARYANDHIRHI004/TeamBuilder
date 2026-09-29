import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { hasAllowedRole, type Role } from "@/lib/authUtils";
import Unauthorized from "@/pages/Unauthorized";

interface RoleProtectedRouteProps {
  allowedRoles: Role[];
  redirectTo?: string;
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ allowedRoles, redirectTo }) => {
  const authUser = useSelector((state: any) => state.auth.user);

  // If user is not logged in, ProtectedRoutes will catch or we can redirect to login
  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  // Check if authenticated user has one of the allowed roles
  const authorized = hasAllowedRole(authUser, allowedRoles);

  if (!authorized) {
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    return <Unauthorized />;
  }

  return <Outlet />;
};

export default RoleProtectedRoute;
