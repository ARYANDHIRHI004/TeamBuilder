import { Router } from "express";
import { systemRoles, verifyJwt } from "../middlewares/auth.middleware.js";
import { prisma } from "../db/db.js";
import ApiError from "../utils/apiError.js";
import { applyToJoinTeam, approveApplication, approveTeamByAdmin, closeHiring, createTeam, getAllapplyToJoinTeam, getAllTeams, getMyCourseTeamStatus, getMyTeams, getTeamById, openHiring, rejectOrRevokeApplication, rejectTeamByAdmin } from "../controllers/team.controllers.js";
import { deleteTeamChatMessage, listTeamChatMessages, pinTeamChatMessage, sendTeamChatMessage } from "../controllers/teamChat.controller.js";
import { teamChatUpload } from "../middlewares/teamChatUpload.js";
import { teamRoles } from "../middlewares/team.middlewares.js";

const teamRouter = Router();


teamRouter.use(verifyJwt);

teamRouter.route('/my-teams').get(getMyTeams);

const checkStudent = async (req: any, _: any, next: any) => {
  try {
    let courseId = req.params.courseId as string;
    const userId = req.user?._id as string | undefined;
    const userEmail = req.user?.email as string | undefined;

    if (!courseId && req.params.teamId) {
      const team = await prisma.team.findUnique({
        where: { id: req.params.teamId as string },
        select: { courseId: true },
      });
      if (team) {
        courseId = team.courseId;
      }
    }

    if (!courseId) {
      throw new ApiError("Course ID is required", 400);
    }

    if (userId) {
      const systemRole = await prisma.systemRoles.findFirst({
        where: { userId },
      });
      if (systemRole?.role === "ADMIN" || systemRole?.role === "SUPERADMIN") {
        return next();
      }
    }

    if (!userEmail) {
      throw new ApiError("You are not enrolled in this course", 400);
    }

    const courseStudent = await prisma.registeredUser.findFirst({
      where: {
        courseId,
        userEmail: { equals: userEmail, mode: "insensitive" },
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

teamRouter.route('/:courseId/my-team-status').get(checkStudent, getMyCourseTeamStatus);
teamRouter.route('/:courseId/create-team').post(checkStudent, createTeam);
teamRouter.route('/:courseId/get-all-teams').get(getAllTeams);
teamRouter.route('/:courseId/:teamId/get-team-by-id').get(checkStudent, getTeamById);
teamRouter.route('/:courseId/:teamId/approve-team').post(
  systemRoles(['ADMIN', 'SUPERADMIN']),
  approveTeamByAdmin,
);
teamRouter.route('/:courseId/:teamId/reject-team').post(
  systemRoles(['ADMIN', 'SUPERADMIN']),
  rejectTeamByAdmin,
);

teamRouter.route(['/:teamId/open-hirering', '/:teamId/open-hiring']).get(checkStudent, teamRoles(["TEAM_LEAD"]), openHiring);
teamRouter.route(['/:teamId/close-hirering', '/:teamId/close-hiring']).get(checkStudent, teamRoles(["TEAM_LEAD"]), closeHiring);
teamRouter.route('/:teamId/apply-to-join-team').post(checkStudent, applyToJoinTeam);

teamRouter.route('/:teamId/get-all-apply-to-join-team').post(checkStudent, teamRoles(["TEAM_LEAD", "MEMBER"]), getAllapplyToJoinTeam);
teamRouter.route('/:teamId/get-all-apply-to-join-team').get(checkStudent, teamRoles(["TEAM_LEAD", "MEMBER"]), getAllapplyToJoinTeam);
teamRouter.route('/:teamId/:applicantUserId/approve-member').post(checkStudent, teamRoles(["TEAM_LEAD"]), approveApplication);
teamRouter.route('/:teamId/:applicantUserId/reject-member').post(checkStudent, teamRoles(["TEAM_LEAD"]), rejectOrRevokeApplication);

teamRouter.route('/:teamId/chat').get(checkStudent, listTeamChatMessages);
teamRouter.route('/:teamId/chat').post(
  checkStudent,
  teamChatUpload.single('file'),
  sendTeamChatMessage,
);
teamRouter.route('/:teamId/chat/:messageId/pin').patch(checkStudent, pinTeamChatMessage);
teamRouter.route('/:teamId/chat/:messageId').delete(checkStudent, deleteTeamChatMessage);

export default teamRouter;