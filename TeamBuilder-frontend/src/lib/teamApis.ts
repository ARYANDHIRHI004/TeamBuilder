import axiosInstance from "./axios";

export interface TeamData {
  id: string;
  teamName: string;
  teamDescription?: string;
  courseId: string;
  status: "ACTIVE" | "INACTIVE";
  hiring: "ACTIVE" | "INACTIVE";
  approvalStatus?: "PENDING" | "APPROVED" | "REJECTED";
  members?: any[];
  applications?: any[];
  notes?: any[];
}

export const getMyTeams = async () => {
  const res = await axiosInstance.get("/team/my-teams");
  return res.data;
};

export const getMyCourseTeamStatus = async (courseId: string) => {
  const res = await axiosInstance.get(`/team/${courseId}/my-team-status`);
  return res.data;
};

export const createTeam = async (courseId: string, teamName: string, teamDescription?: string) => {
  const res = await axiosInstance.post(`/team/${courseId}/create-team`, { teamName, teamDescription });
  return res.data;
};

export const getAllTeams = async (courseId: string) => {
  const res = await axiosInstance.get(`/team/${courseId}/get-all-teams`);
  return res.data;
};

export const getTeamById = async (courseId: string, teamId: string) => {
  const res = await axiosInstance.get(`/team/${courseId}/${teamId}/get-team-by-id`);
  return res.data;
};

export const openHiring = async (teamId: string) => {
  const res = await axiosInstance.get(`/team/${teamId}/open-hirering`);
  return res.data;
};

export const closeHiring = async (teamId: string) => {
  const res = await axiosInstance.get(`/team/${teamId}/close-hirering`);
  return res.data;
};

export const applyToJoinTeam = async (teamId: string, description?: string) => {
  const res = await axiosInstance.post(`/team/${teamId}/apply-to-join-team`, { description });
  return res.data;
};

export const getAllApplications = async (teamId: string) => {
  const res = await axiosInstance.post(`/team/${teamId}/get-all-apply-to-join-team`);
  return res.data;
};

export const approveApplicant = async (teamId: string, applicantUserId: string) => {
  const res = await axiosInstance.post(`/team/${teamId}/${applicantUserId}/approve-member`);
  return res.data;
};

export const rejectApplicant = async (teamId: string, applicantUserId: string) => {
  const res = await axiosInstance.post(`/team/${teamId}/${applicantUserId}/reject-member`);
  return res.data;
};

export const approveTeamByAdmin = async (courseId: string, teamId: string) => {
  const res = await axiosInstance.post(`/team/${courseId}/${teamId}/approve-team`);
  return res.data;
};

export const rejectTeamByAdmin = async (courseId: string, teamId: string) => {
  const res = await axiosInstance.post(`/team/${courseId}/${teamId}/reject-team`);
  return res.data;
};
