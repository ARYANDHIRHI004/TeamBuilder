import { Navigate, Route, Routes } from "react-router";
import Layout from "../app/Layout";
import Dashboard from "../app/dashboard/Dashboard";
export function DashboardRoutes({authUser}: any) {


  return (
      <Routes>
        <Route path="/dashboard" element={<Layout />}>

          <Route
            path="/dashboard/"
            element={authUser ? <Dashboard /> : <Navigate to={"/login"} />}
          />

        </Route>
      </Routes>
  );
}
