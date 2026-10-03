import axiosInstance from "./axios";

export interface CourseData {
  id: string;
  courseName: string;
  courseDescription?: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
  teams?: any[];
  registeredUsers?: any[];
}

export const getAllCourses = async () => {
  const res = await axiosInstance.get("/courses/get-all-courses");
  return res.data;
};

export const getAllEnrolledCourses = async () => {
  const res = await axiosInstance.get("/courses/get-all-enroled-courses");
  return res.data;
};

export const getCourseById = async (courseId: string) => {
  const res = await axiosInstance.get(`/courses/${courseId}/get-course-by-id`);
  return res.data;
};

export const createCourse = async (courseName: string, courseDescription?: string) => {
  const res = await axiosInstance.post("/courses/create-course", { courseName, courseDescription });
  return res.data;
};

export const uploadStudentCsv = async (courseId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await axiosInstance.post(
    `/courses/${courseId}/upload-students-details-enroled-in-this-course`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
};

export const addStudentManual = async (courseId: string, userEmail: string) => {
  const res = await axiosInstance.post(`/courses/${courseId}/add-student-manual`, { userEmail });
  return res.data;
};

export const addStudentsManual = async (courseId: string, emails: string[]) => {
  const res = await axiosInstance.post(`/courses/${courseId}/add-student-manual`, { emails });
  return res.data;
};

export const getPeersAccount = async (courseId: string) => {
  const res = await axiosInstance.get(`/courses/${courseId}/get-peers-account`);
  return res.data;
};

export const getAllPeersForUser = async () => {
  const res = await axiosInstance.get("/courses/get-all-peers");
  return res.data;
};

export const syncRegisteredStudents = async () => {
  const res = await axiosInstance.post("/courses/sync-registered-students");
  return res.data;
};
