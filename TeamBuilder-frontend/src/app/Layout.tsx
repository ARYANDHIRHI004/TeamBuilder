import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import { AdminLayout, UserLayout } from "../components/SideBar";
import { isAdminUser, extractUser } from "@/lib/authUtils";
import NavBar from "../components/NavBar";

const Layout = () => {
  const rawUser = useSelector((state: any) => state.auth.user);
  const user = extractUser(rawUser);
  const isAdmin = isAdminUser(rawUser);

  // Build the user object expected by the sidebar footer
  const sidebarUser = user
    ? { name: user.name || "User", email: user.email || "" }
    : undefined;

  if (isAdmin) {
    return (
      <AdminLayout title="Admin Dashboard" user={sidebarUser}>
        <NavBar />
        <Outlet />
      </AdminLayout>
    );
  }

  return (
    <UserLayout title="My Workspace" user={sidebarUser}>
      <NavBar />
      <Outlet />
    </UserLayout>
  );
};

export default Layout;
