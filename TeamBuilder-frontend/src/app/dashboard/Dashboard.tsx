import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { isAdminUser } from "@/lib/authUtils";
import AdminDashboard, { type Cohort, type AdminUser, type CreateCohortInput } from "@/components/AdminDashboard";
import UserDashboard from "@/components/UserDashboard";
import { getAllCourses, createCourse } from "@/lib/courseApis";
import { getAdmins } from "@/lib/authApis";

const Dashboard: React.FC = () => {
  const authUser = useSelector((state: any) => state.auth.user);
  const isAdmin = isAdminUser(authUser);

  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(isAdmin);

  const fetchAdminData = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const [coursesRes, adminsRes] = await Promise.all([getAllCourses(), getAdmins()]);
      const courses = coursesRes.data || [];
      const mappedCohorts: Cohort[] = courses.map((c: any) => {
        const studentCount = c._count?.registeredUsers ?? 0;
        const capacity = Math.max(studentCount, 30);
        return {
          id: c.id,
          name: c.courseName,
          description: c.courseDescription,
          status: "Active",
          startDate: c.createdAt,
          endDate: c.updatedAt || c.createdAt,
          studentCount,
          capacity,
          createdBy: c.creater?.name,
        };
      });
      setCohorts(mappedCohorts);
      setAdmins(adminsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleCreateCohort = async (input: CreateCohortInput) => {
    await createCourse(input.name, input.description);
    await fetchAdminData();
  };

  if (isAdmin) {
    return (
      <AdminDashboard
        user={authUser}
        cohorts={cohorts}
        admins={admins}
        loading={loading}
        onCreateCohort={handleCreateCohort}
      />
    );
  }

  return <UserDashboard user={authUser} />;
};

export default Dashboard;
