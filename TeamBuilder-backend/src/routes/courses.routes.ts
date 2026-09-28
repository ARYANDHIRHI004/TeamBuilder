import { Router } from "express";
import { systemRoles, verifyJwt } from "../middlewares/auth.middleware.js";
import {
  addStudentDetails,
  addStudentManual,
  createCourse,
  getAllCourse,
  getAllEnroledCourse,
  getCourseById,
  getPeersAccount
} from "../controllers/course.controller.js";
import { upload } from "../middlewares/multer.js";

const courseRouter = Router();

courseRouter.use(verifyJwt);

courseRouter.route('/create-course').post(systemRoles(["ADMIN"]), createCourse);
courseRouter.route('/get-all-courses').get(systemRoles(["ADMIN", "SUPERADMIN"]), getAllCourse);
courseRouter.route('/get-all-enroled-courses').get(getAllEnroledCourse);
courseRouter.route('/:courseId/get-course-by-id').get(getCourseById);

// CSV upload route
courseRouter.route('/:courseId/upload-students-details-enroled-in-this-course').post(
  systemRoles(["ADMIN"]),
  upload.single('file'),
  addStudentDetails
);

// Manual student details route
courseRouter.route('/:courseId/add-student-manual').post(
  systemRoles(["ADMIN"]),
  addStudentManual
);

courseRouter.route('/:courseId/get-peers-account').get(getPeersAccount);

export { courseRouter };


