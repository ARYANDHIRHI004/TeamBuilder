import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { prisma } from "../db/db.js";
import ApiError from "../utils/apiError.js";
import { createTeam, getAllTeams, getTeamById } from "../controllers/team.controllers.js";

const teamRouter = Router();


teamRouter.use(verifyJwt);
const chechStudent = async(req, _, next) => {

    const courseId  = req.params.courseId as string
    const userEmail = req.user?.email
    const courseStudent = await prisma.registeredUser.findFirst({
        where:{
            courseId,
            userEmail
        }
     })
    
     console.log(courseId)
     if(!courseStudent){
        throw new ApiError('You are not enrolled in this course', 400);
     }
     next();
}

teamRouter.route('/:courseId/create-team').post(chechStudent, createTeam);
teamRouter.route('/:courseId/get-all-teams').get(getAllTeams);
teamRouter.route('/:courseId/:teamId/get-team-by-id').get(chechStudent, getTeamById);
// teamRouter.route('/:teamId/open-hirering').get(openHiring);
// teamRouter.route('/:teamId/apply-to-join-team').post(applyToJoinTeam);


export default teamRouter ;