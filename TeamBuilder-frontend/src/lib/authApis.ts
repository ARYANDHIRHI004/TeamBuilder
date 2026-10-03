import axiosInstance from "./axios"

export const loginUser = async() => {
  const res = await axiosInstance.get("/auth/get-me")
  return res.data
}
export const logoutUser = async() => {
  const res = await axiosInstance.get("/auth/logout")
  return res.data
}

export const getAdmins = async () => {
  const res = await axiosInstance.get("/auth/get-admins");
  return res.data;
};

export const getMyReviews = async () => {
  const res = await axiosInstance.get("/auth/get-my-reviews");
  return res.data;
};

export const getUserProfile = async (userId: string) => {
  const res = await axiosInstance.get(`/auth/users/${userId}/profile`);
  return res.data;
};

export const updateMyProfile = async (data: { name?: string; address?: string | null }) => {
  const res = await axiosInstance.patch("/auth/users/me/profile", data);
  return res.data;
};
