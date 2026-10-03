import axiosInstance from "./axios";

export const getAllStudentsAdmin = async () => {
  const res = await axiosInstance.get("/admin/students");
  return res.data;
};

export const getAllTeamsAdmin = async () => {
  const res = await axiosInstance.get("/admin/teams");
  return res.data;
};

export const setUserBlockStatus = async (userId: string, blocked: boolean) => {
  const res = await axiosInstance.patch(`/admin/users/${userId}/block-status`, { blocked });
  return res.data;
};

export const setTeamBlockStatus = async (teamId: string, blocked: boolean) => {
  const res = await axiosInstance.patch(`/admin/teams/${teamId}/block-status`, { blocked });
  return res.data;
};
