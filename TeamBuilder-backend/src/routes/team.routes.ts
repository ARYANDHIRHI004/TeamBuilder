import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { prisma } from "../db/db.js";
import ApiError from "../utils/apiError.js";
import { applyToJoinTeam, approveApplication, createTeam, getAllapplyToJoinTeam, getAllTeams, getTeamById, openHiring, rejectOrRevokeApplication } from "../controllers/team.controllers.js";
import { teamRoles } from "../middlewares/team.middlewares.js";

const teamRouter = Router();


teamRouter.use(verifyJwt);
const checkStudent = async(req: any, _: any, next: any) => {

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

teamRouter.route('/:courseId/create-team').post(checkStudent, createTeam);
teamRouter.route('/:courseId/get-all-teams').get(getAllTeams);
teamRouter.route('/:courseId/:teamId/get-team-by-id').get(checkStudent, getTeamById);
teamRouter.route('/:teamId/open-hirering').get(teamRoles(["TEAM_LEAD"]), openHiring);
teamRouter.route('/:teamId/apply-to-join-team').post(applyToJoinTeam);


teamRouter.route('/:teamId/get-all-apply-to-join-team').post(teamRoles(["TEAM_LEAD"]), getAllapplyToJoinTeam);
teamRouter.route('/:teamId/:applicantUserId/approve-member').post(teamRoles(["TEAM_LEAD"]), approveApplication);
teamRouter.route('/:teamId/:applicantUserId/reject-member').post(teamRoles(["TEAM_LEAD"]), rejectOrRevokeApplication);

 
export default teamRouter ;