import axiosInstance from "./axios"

export const loginUser = async() => {
  const res = await axiosInstance.get("/auth/get-me")
  return res.data
}
