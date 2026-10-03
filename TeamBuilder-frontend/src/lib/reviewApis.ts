import axiosInstance from "./axios";

export const createReview = async (payload: {
  review: string;
  givenToUserId?: string;
  givenToTeamId?: string;
}) => {
  const res = await axiosInstance.post("/reviews/create", payload);
  return res.data;
};

export const getMyReviews = async () => {
  const res = await axiosInstance.get("/reviews/mine");
  return res.data;
};

export const getReviewsForUser = async (userId: string) => {
  const res = await axiosInstance.get(`/reviews/user/${userId}`);
  return res.data;
};

export const getAllReviewsAdmin = async () => {
  const res = await axiosInstance.get("/reviews/all");
  return res.data;
};
