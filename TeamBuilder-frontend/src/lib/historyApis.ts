import axiosInstance from "./axios";

export const getUserHistory = async (userId: string) => {
  const res = await axiosInstance.get(`/history/${userId}/get-history`);
  return res.data;
};
