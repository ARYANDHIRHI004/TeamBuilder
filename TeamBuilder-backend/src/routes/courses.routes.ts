import { Router } from "express";
import { systemRoles, verifyJwt } from "../middlewares/auth.middleware.js";
import { createCourse } from "../controllers/course.controller.js";

const courseRouter = Router();

courseRouter.use(verifyJwt)

courseRouter.route('/create-course').post(systemRoles(["ADMIN"]), createCourse);
courseRouter.route('/get-all-courses').post(systemRoles(["ADMIN", "SUPERADMIN"]), createCourse);
courseRouter.route('/get-all-enroled-courses').post(createCourse);
courseRouter.route('/:courseId/get-course-by-id').post(createCourse);
courseRouter.route('/:courseId/upload-students-details-enroled-in-this-course').post(systemRoles(["ADMIN"]),createCourse);



export { courseRouter }

