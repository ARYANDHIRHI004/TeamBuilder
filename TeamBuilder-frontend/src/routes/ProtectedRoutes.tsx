import { useSelector } from "react-redux";
<<<<<<< HEAD
import { Outlet } from "react-router-dom";
=======
import { Navigate, Outlet } from "react-router-dom";
>>>>>>> 6245d4224e7fffcc0f4aa729bd3a27afe6682704
import Login from "../pages/Login";

const ProtectedRoutes = () => {
  const authUser = useSelector((state: any) => state.auth.user);


  return !authUser ? <Login/> :<Outlet /> ;
};

export default ProtectedRoutes;
