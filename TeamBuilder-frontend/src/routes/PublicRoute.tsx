import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoutes = () => {
  const authUser = useSelector((state: any) => state.auth.user);

  // Already logged-in users are always sent to /dashboard
  // Dashboard.tsx will decide whether to show Admin or User view
  return authUser ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default PublicRoutes;
