import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoutes = () => {
  const authUser = useSelector((state: any) => state.auth.user);


  return authUser ? <Outlet /> : <Navigate to={"/login"} replace />;
};

export default ProtectedRoutes;
