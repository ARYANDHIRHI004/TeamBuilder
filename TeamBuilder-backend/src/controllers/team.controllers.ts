import { prisma } from '../db/db.js';
import ApiError from '../utils/apiError';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import type { Request, Response } from 'express';

export const createTeam = asyncHandler(async (req: Request, res: Response) => {
  const { teamName, teamDescription } = req.body;
  const { courseId } = req.params;

  const existedTemaMemberteam = await prisma.teamMember.findFirst({
    where: {
      memberId: (req.user as any)?._id,
<<<<<<< HEAD
      team: {
        courseId: `${courseId}`,
      },
=======
>>>>>>> 6245d4224e7fffcc0f4aa729bd3a27afe6682704
    },
  });

  if (existedTemaMemberteam) {
    throw new ApiError('You are already a member of a team in this course', 400);
  }

  const existedTeam = await prisma.team.findUnique({
    where: {
      teamName,
    },
  });

  if (existedTeam) {
    throw new ApiError('Team name already exists', 400);
  }

  const team = await prisma.team.create({
    data: {
      teamName,
      teamDescription,
      courseId: `${courseId}`,
    },
  });

  await prisma.teamMember.create({
    data: {
      teamId: team.id,
      memberId: (req.user as any)?._id,
      role: 'TEAM_LEAD',
    },
  });

  await prisma.history.create({
<<<<<<< HEAD
    data: {
      userId: (req.user as any)?._id,
      teamId: team.id,
      description: `Team '${teamName}' created by ${(req.user as any)?.name || 'user'}`,
    },
  });
=======
    data:{
        userId: (req.user as any)?._id,
        description: `Team created by ${(req.user as any)?.name} with team name ${teamName}`,
    }
  })
>>>>>>> 6245d4224e7fffcc0f4aa729bd3a27afe6682704

  return res
    .status(200)
    .json(new ApiResponse(200, 'Team created successfully', team));
});

export const getAllTeams = asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;

  const teams = await prisma.team.findMany({
    where: {
      courseId: `${courseId}`,
    },
    include: {
      members: {
        include: {
          member: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      applications: true,
      notes: true,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, 'All teams fetched successfully', teams));
});

export const getTeamById = asyncHandler(async (req: Request, res: Response) => {
  const { teamId } = req.params;

  const team = await prisma.team.findUnique({
    where: {
      id: `${teamId}`,
    },
    include: {
      members: {
        include: {
          member: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      applications: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      notes: true,
      course: true,
    },
  });

  if (!team) {
    throw new ApiError('No such team found', 404);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, 'Team details fetched successfully', team));
});

export const openHiring = asyncHandler(async (req: Request, res: Response) => {
  const { teamId } = req.params;

  const team = await prisma.team.update({
    where: {
      id: `${teamId}`,
    },
    data: {
      hiring: 'ACTIVE',
    },
  });

  return res.status(200).json(new ApiResponse(200, 'Team is hiring now', team));
});

export const closeHiring = asyncHandler(async (req: Request, res: Response) => {
  const { teamId } = req.params;

  const team = await prisma.team.update({
    where: {
      id: `${teamId}`,
    },
    data: {
      hiring: 'INACTIVE',
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, 'Team is not hiring now', team));
});

export const applyToJoinTeam = asyncHandler(async (req: Request, res: Response) => {
  const { teamId } = req.params;
  const { description } = req.body;
  const userId = (req.user as any)?._id;

<<<<<<< HEAD
  const targetTeam = await prisma.team.findUnique({
    where: { id: `${teamId}` },
  });

  if (!targetTeam) {
    throw new ApiError('Team does not exist', 404);
  }

  const existedTeamMember = await prisma.teamMember.findFirst({
    where: {
      memberId: userId,
      team: {
        courseId: targetTeam.courseId,
=======
    const existedTemaMemberteam = await prisma.teamMember.findFirst({
      where: {
        memberId: (req.user as any)?._id,
>>>>>>> 6245d4224e7fffcc0f4aa729bd3a27afe6682704
      },
    },
  });

  if (existedTeamMember) {
    throw new ApiError('You are already a member of a team in this course', 400);
  }

<<<<<<< HEAD
  const existingApp = await prisma.teamJoiningApplication.findFirst({
    where: {
      teamId: `${teamId}`,
      userId: userId,
    },
  });
=======
    const joingingApplication = await prisma.teamJoiningApplication.create({
      data: {
        teamId: `${teamId}`,
        userId: (req.user as any)?._id,
        description,
      },
    });
>>>>>>> 6245d4224e7fffcc0f4aa729bd3a27afe6682704

  if (existingApp) {
    throw new ApiError('You have already applied to join this team', 400);
  }

  const joiningApplication = await prisma.teamJoiningApplication.create({
    data: {
      teamId: `${teamId}`,
      userId: userId,
      description,
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        'Applied to team successfully',
        joiningApplication,
      ),
    );
});

export const getAllapplyToJoinTeam = asyncHandler(async (req: Request, res: Response) => {
  const { teamId } = req.params;

  const joiningApplications = await prisma.teamJoiningApplication.findMany({
    where: {
      teamId: `${teamId}`,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        'All applications fetched successfully',
        joiningApplications,
      ),
    );
});

export const approveApplication = asyncHandler(async (req: Request, res: Response) => {
  const { teamId, applicantUserId } = req.params;

  const joiningApplication = await prisma.teamJoiningApplication.findFirst({
    where: {
      teamId: `${teamId}`,
      OR: [
        { id: `${applicantUserId}` },
        { userId: `${applicantUserId}` },
      ],
    },
  });

  if (!joiningApplication) {
    throw new ApiError('No such application found', 404);
  }

  const approvedMember = await prisma.teamMember.create({
    data: {
      teamId: `${teamId}`,
      memberId: joiningApplication.userId,
      role: 'MEMBER',
    },
  });

  await prisma.teamJoiningApplication.delete({
    where: {
      id: joiningApplication.id,
    },
  });

  await prisma.history.create({
    data: {
      userId: joiningApplication.userId,
      teamId: `${teamId}`,
      description: `User was approved as a team member`,
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, 'Application accepted and member added', approvedMember),
    );
});

export const rejectOrRevokeApplication = asyncHandler(async (req: Request, res: Response) => {
  const { teamId, applicantUserId } = req.params;

  const joiningApplication = await prisma.teamJoiningApplication.findFirst({
    where: {
      teamId: `${teamId}`,
      OR: [
        { id: `${applicantUserId}` },
        { userId: `${applicantUserId}` },
      ],
    },
  });

  if (!joiningApplication) {
    throw new ApiError('No such application found', 404);
  }

  const rejectedApplication = await prisma.teamJoiningApplication.delete({
    where: {
      id: joiningApplication.id,
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, 'Application revoked/rejected', rejectedApplication),
    );
});



       
