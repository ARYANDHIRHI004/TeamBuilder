import { Navigate, Route, Routes } from "react-router";
import Login from "../pages/Login";
import Welcome from "../pages/Welcome";
export function AuthRoutes({authUser}:any) {


  return (
      <Routes>
        <Route
            path="/"
            element={
              !authUser ? <Welcome /> : <Navigate to={"/dashboard"} />
            }
          />
        <Route path="/login" element={!authUser ? <Login />: <Navigate to={"/"} />} />
      </Routes>
  );
}
