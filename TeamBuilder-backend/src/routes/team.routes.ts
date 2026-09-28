import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { prisma } from "../db/db.js";
import ApiError from "../utils/apiError.js";
import { applyToJoinTeam, approveApplication, closeHiring, createTeam, getAllapplyToJoinTeam, getAllTeams, getTeamById, openHiring, rejectOrRevokeApplication } from "../controllers/team.controllers.js";
import { teamRoles } from "../middlewares/team.middlewares.js";

const teamRouter = Router();


teamRouter.use(verifyJwt);
const checkStudent = async (req: any, _: any, next: any) => {
  try {
    let courseId = req.params.courseId as string;
    const userEmail = req.user?.email;

    if (!courseId && req.params.teamId) {
      const team = await prisma.team.findUnique({
        where: { id: req.params.teamId },
        select: { courseId: true },
      });
      if (team) {
        courseId = team.courseId;
      }
    }

    if (!courseId) {
      throw new ApiError("Course ID is required", 400);
    }

    const courseStudent = await prisma.registeredUser.findFirst({
      where: {
        courseId,
        userEmail,
      },
    });

    if (!courseStudent) {
      throw new ApiError("You are not enrolled in this course", 400);
    }
    next();
  } catch (error) {
    next(error);
  }
};

teamRouter.route('/:courseId/create-team').post(checkStudent, createTeam);
teamRouter.route('/:courseId/get-all-teams').get(getAllTeams);
teamRouter.route('/:courseId/:teamId/get-team-by-id').get(checkStudent, getTeamById);

teamRouter.route(['/:teamId/open-hirering', '/:teamId/open-hiring']).get(checkStudent, teamRoles(["TEAM_LEAD"]), openHiring);
teamRouter.route(['/:teamId/close-hirering', '/:teamId/close-hiring']).get(checkStudent, teamRoles(["TEAM_LEAD"]), closeHiring);
teamRouter.route('/:teamId/apply-to-join-team').post(checkStudent, applyToJoinTeam);

teamRouter.route('/:teamId/get-all-apply-to-join-team').post(checkStudent, teamRoles(["TEAM_LEAD"]), getAllapplyToJoinTeam);
teamRouter.route('/:teamId/get-all-apply-to-join-team').get(checkStudent, teamRoles(["TEAM_LEAD"]), getAllapplyToJoinTeam);
teamRouter.route('/:teamId/:applicantUserId/approve-member').post(checkStudent, teamRoles(["TEAM_LEAD"]), approveApplication);
teamRouter.route('/:teamId/:applicantUserId/reject-member').post(checkStudent, teamRoles(["TEAM_LEAD", "MEMBER"]), rejectOrRevokeApplication);

export default teamRouter;