import axiosInstance from "./axios";

export const createNote = async (teamId: string, note: string) => {
  const res = await axiosInstance.post(`/notes/${teamId}/teams/create-note`, { note });
  return res.data;
};

export const getAllNotes = async (teamId: string) => {
  const res = await axiosInstance.get(`/notes/${teamId}/teams/get-all-notes`);
  return res.data;
};

export const updateNote = async (teamId: string, noteId: string, note: string) => {
  const res = await axiosInstance.patch(`/notes/${teamId}/teams/${noteId}/update-note`, { note });
  return res.data;
};

export const deleteNote = async (teamId: string, noteId: string) => {
  const res = await axiosInstance.delete(`/notes/${teamId}/teams/${noteId}/delete-note`);
  return res.data;
};
