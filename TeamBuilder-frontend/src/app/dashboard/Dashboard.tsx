import React from "react";
import { useSelector } from "react-redux";
import { isAdminUser } from "@/lib/authUtils";
import AdminDashboard from "@/components/AdminDashboard";
import UserDashboard from "@/components/UserDashboard";

const Dashboard: React.FC = () => {
  const authUser = useSelector((state: any) => state.auth.user);

  // If user is an Admin / SuperAdmin, render Admin Dashboard
  if (isAdminUser(authUser)) {
    return (
      <AdminDashboard
        user={authUser}
        onCreateCohort={() => Promise.resolve()}
      />
    );
  }

  // Default for normal users / students
  return <UserDashboard user={authUser} />;
};

export default Dashboard;
