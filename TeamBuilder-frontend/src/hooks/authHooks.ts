import { useSelector } from "react-redux";

export function useAuth() {
  const { user } = useSelector((state: any) => state.auth);
  return { user };
}