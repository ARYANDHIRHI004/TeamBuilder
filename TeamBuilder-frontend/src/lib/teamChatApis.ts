import axiosInstance from "./axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface TeamChatMessage {
  id: string;
  teamId: string;
  senderId: string;
  content: string | null;
  resourceUrl: string | null;
  resourceName: string | null;
  resourceMime: string | null;
  isPinned: boolean;
  pinnedAt: string | null;
  isDeleted: boolean;
  createdAt: string;
  sender?: { id: string; name: string; email: string };
}

export const getTeamChatMessages = async (teamId: string) => {
  const res = await axiosInstance.get(`/team/${teamId}/chat`);
  return res.data;
};

export const sendTeamChatMessage = async (
  teamId: string,
  payload: { content?: string; file?: File }
) => {
  const form = new FormData();
  if (payload.content?.trim()) form.append("content", payload.content.trim());
  if (payload.file) form.append("file", payload.file);
  const res = await axiosInstance.post(`/team/${teamId}/chat`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const pinTeamChatMessage = async (
  teamId: string,
  messageId: string,
  pinned: boolean
) => {
  const res = await axiosInstance.patch(`/team/${teamId}/chat/${messageId}/pin`, {
    pinned,
  });
  return res.data;
};

export const deleteTeamChatMessage = async (teamId: string, messageId: string) => {
  const res = await axiosInstance.delete(`/team/${teamId}/chat/${messageId}`);
  return res.data;
};

export const teamChatResourceUrl = (resourceUrl: string) => {
  if (resourceUrl.startsWith("http")) return resourceUrl;
  return `${API_BASE}${resourceUrl}`;
};
