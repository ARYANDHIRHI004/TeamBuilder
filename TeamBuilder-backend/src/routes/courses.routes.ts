import { Router } from "express";
import { systemRoles, verifyJwt } from "../middlewares/auth.middleware.js";
import { addStudentDetails, createCourse, getAllCourse, getAllEnroledCourse, getCourseById, getPeersAccount } from "../controllers/course.controller.js";

const courseRouter = Router();

courseRouter.use(verifyJwt)

courseRouter.route('/create-course').post(systemRoles(["ADMIN"]), createCourse);
courseRouter.route('/get-all-courses').get(systemRoles(["ADMIN", "SUPERADMIN"]), getAllCourse);
courseRouter.route('/get-all-enroled-courses').get(getAllEnroledCourse);
courseRouter.route('/:courseId/get-course-by-id').get(getCourseById);
courseRouter.route('/:courseId/upload-students-details-enroled-in-this-course').post(systemRoles(["ADMIN"]),addStudentDetails);
courseRouter.route('/:courseId/get-peers-account').get(getPeersAccount);



export { courseRouter }

