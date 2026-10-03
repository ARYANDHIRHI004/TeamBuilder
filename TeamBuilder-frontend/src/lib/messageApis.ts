import axiosInstance from "./axios";

export interface DirectMessage {
  id: string;
  courseId: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  sender?: { id: string; name: string };
  receiver?: { id: string; name: string };
}

export const getConversation = async (courseId: string, peerId: string) => {
  const res = await axiosInstance.get(`/messages/${courseId}/${peerId}`);
  return res.data;
};

export const sendDirectMessage = async (courseId: string, peerId: string, content: string) => {
  const res = await axiosInstance.post(`/messages/${courseId}/${peerId}`, { content });
  return res.data;
};
