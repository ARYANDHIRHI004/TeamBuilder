import axiosInstance from "./axios"

export const loginUser = async() => {
  const res = await axiosInstance.get("/auth/get-me")
  return res.data
}
export const logoutUser = async() => {
  const res = await axiosInstance.get("/auth/logout")
  return res.data
}
