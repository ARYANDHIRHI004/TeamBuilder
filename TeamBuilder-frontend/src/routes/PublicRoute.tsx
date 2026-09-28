import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoutes = () => {
  const authUser = useSelector((state: any) => state.auth.user);
  console.log("aryan", authUser)

  return authUser ? <Navigate to={"/dashboard"} replace />: <Outlet /> ;
};

export default PublicRoutes;
