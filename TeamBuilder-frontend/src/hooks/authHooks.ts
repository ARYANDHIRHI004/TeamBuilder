import { useSelector } from "react-redux";
import { getUserRoles, isAdminUser, isStudentUser, extractUser } from "@/lib/authUtils";

export function useAuth() {
  const rawUser = useSelector((state: any) => state.auth.user);
  const user = extractUser(rawUser);
  const roles = getUserRoles(rawUser);
  const isAdmin = isAdminUser(rawUser);
  const isStudent = isStudentUser(rawUser);

  return { user, rawUser, roles, isAdmin, isStudent };
}