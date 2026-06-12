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
      memberId: req.user?._id,
    },
  });

  if (existedTemaMemberteam) {
    throw new ApiError('You are already a member of a team', 400);
  }

  const existedTeam = await prisma.team.findUnique({
    where: {
      teamName,
      courseId: `${courseId}`,
    },
  });

  if (existedTeam) {
    throw new ApiError('Team already exist', 400);
  }

  const team = await prisma.team.create({
    data: {
      teamName,
      teamDescription,
      courseId: `${courseId}`,
    },
  });

  const teamMember = await prisma.teamMember.create({
    data: {
      teamId: team.id,
      memberId: req.user?._id,
      role: 'TEAM_LEAD',
    },
  });
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
  });

  if (!teams) {
    throw new ApiError('No team are registered', 400);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, 'Team created successfully', teams));
});

export const getTeamById = asyncHandler(async (req: Request, res: Response) => {
  const { courseId, teamId } = req.params;

  const team = await prisma.team.findFirst({
    where: {
      courseId: `${courseId}`,
      id: `${teamId}`,
    },
  });

  if (!team) {
    throw new ApiError('No such team', 400);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, 'Team created successfully', team));
});

export const openHiring = asyncHandler(async (req: Request, res: Response) => {
  const { courseId, teamId } = req.params;

  const team = await prisma.team.update({
    where: {
      courseId: `${courseId}`,
      id: `${teamId}`,
    },
    data: {
      hiring: 'ACTIVE',
    },
  });

  if (!team) {
    throw new ApiError('No such team', 400);
  }

  return res.status(200).json(new ApiResponse(200, 'Team is hiring now', team));
});

export const cloaseHiring = asyncHandler(async (req: Request, res: Response) => {
    const { courseId, teamId } = req.params;

    const team = await prisma.team.update({
      where: {
        courseId: `${courseId}`,
        id: `${teamId}`,
      },
      data: {
        hiring: 'INACTIVE',
      },
    });

    if (!team) {
      throw new ApiError('No such team', 400);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, 'Team is not hiring now', team));
  },
);

export const applyToJoinTeam = asyncHandler(async (req: Request, res: Response) => {
    const { teamId } = req.params;
    const { description } = req.body;

    const existedTemaMemberteam = await prisma.teamMember.findFirst({
      where: {
        memberId: req.user?._id,
      },
    });

    if (existedTemaMemberteam) {
      throw new ApiError('You are already a member of a team', 400);
    }

    const joingingApplication = await prisma.teamJoiningApplication.create({
      data: {
        teamId: `${teamId}`,
        userId: req.user?._id,
        description,
      },
    });

    if (!joingingApplication) {
      throw new ApiError('No such team', 400);
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          'Applied in team successfully',
          joingingApplication,
        ),
      );
  },
);

export const getAllapplyToJoinTeam = asyncHandler(async (req: Request, res: Response) => {
    const { teamId } = req.params;

    const joingingApplication = await prisma.teamJoiningApplication.findMany({
      where: {
        teamId: `${teamId}`,
      },
    });

    if (!joingingApplication) {
      throw new ApiError('No any application', 400);
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          'All application fetched successfully',
          joingingApplication,
        ),
      );
  },
);

export const approveApplication = asyncHandler(async (req: Request, res: Response) => {
    const { teamId, applicantUserId } = req.params;

    const joingingApplication = await prisma.teamJoiningApplication.findUnique({
      where: {
        id: `${applicantUserId}`,
        teamId: `${teamId}`,
      },
    });

    if (!joingingApplication) {
      throw new ApiError('No such application', 400);
    }

    const approvedApplication = await prisma.teamMember.create({
      data: {
        teamId: `${teamId}`,
        memberId: joingingApplication.userId,
      },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, 'Application is accepted', approvedApplication),
      );
  },
);

export const rejectOrRevokeApplication = asyncHandler(async (req: Request, res: Response) => {
    const { teamId, applicantUserId } = req.params;

    const joingingApplication = await prisma.teamJoiningApplication.findUnique({
      where: {
        id: `${applicantUserId}`,
        teamId: `${teamId}`,
      },
    });

    if (!joingingApplication) {
      throw new ApiError('No such application', 400);
    }

    const rejectedApplication = await prisma.teamJoiningApplication.delete({
      where: {
        id: `${applicantUserId}`,
        teamId: `${teamId}`,
      },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, 'Application is revoked', rejectedApplication),
      );
  },
);




