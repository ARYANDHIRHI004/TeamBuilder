import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { AdminLayout, UserLayout } from "../components/SideBar";
import { isAdminUser, extractUser } from "@/lib/authUtils";
import NavBar from "../components/NavBar";
import { logout } from "@/features/authSlice";
import { logoutUser } from "@/lib/authApis";

const Layout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const rawUser = useSelector((state: any) => state.auth.user);
  const user = extractUser(rawUser);
  const isAdmin = isAdminUser(rawUser);

  const sidebarUser = user
    ? { name: user.name || "User", email: user.email || "" }
    : undefined;

  const handleLogout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(logout());
      navigate("/login", { replace: true });
    }
  }, [dispatch, navigate]);

  if (isAdmin) {
    return (
      <AdminLayout title="Admin Dashboard" user={sidebarUser} onLogout={handleLogout}>
        <NavBar />
        <Outlet />
      </AdminLayout>
    );
  }

  return (
    <UserLayout title="My Workspace" user={sidebarUser} onLogout={handleLogout}>
      <NavBar />
      <Outlet />
    </UserLayout>
  );
};

export default Layout;
