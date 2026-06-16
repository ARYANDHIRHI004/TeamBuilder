import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import Login from "../pages/Login";

const ProtectedRoutes = () => {
  const authUser = useSelector((state: any) => state.auth.user);


  return !authUser ? <Login /> :<Outlet /> ;
};

export default ProtectedRoutes;
