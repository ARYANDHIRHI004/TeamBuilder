import { prisma } from '../db/db.js';
import ApiError from '../utils/apiError';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import type { Request, Response } from 'express';

async function findCourseTeamMembership(userId: string, courseId: string) {
  return prisma.teamMember.findFirst({
    where: {
      memberId: userId,
      team: { courseId },
    },
    include: { team: { select: { id: true, teamName: true } } },
  });
}

async function assertNotInAnyTeamInCourse(
  userId: string,
  courseId: string,
  action: 'join' | 'create',
) {
  const membership = await findCourseTeamMembership(userId, courseId);
  if (!membership) return;

  const verb = action === 'create' ? 'create a team' : 'join a team';
  throw new ApiError(
    `You are already in "${membership.team.teamName}" for this course. You cannot ${verb} until you leave your current team.`,
    400,
  );
}

async function isRequesterAdmin(userId: string) {
  const role = await prisma.systemRoles.findFirst({ where: { userId } });
  return role?.role === 'ADMIN' || role?.role === 'SUPERADMIN';
}

async function assertNoPendingApplicationInCourse(
  userId: string,
  courseId: string,
  exceptTeamId?: string,
) {
  const pending = await prisma.teamJoiningApplication.findFirst({
    where: {
      userId,
      team: { courseId },
      ...(exceptTeamId ? { teamId: { not: exceptTeamId } } : {}),
    },
    include: { team: { select: { teamName: true } } },
  });

  if (pending) {
    throw new ApiError(
      `You already have a pending application for "${pending.team.teamName}" in this course.`,
      400,
    );
  }
}

export const getMyCourseTeamStatus = asyncHandler(async (req: Request, res: Response) => {
  const courseId = req.params.courseId as string;
  const userId = (req.user as any)?._id as string;

  const membership = await findCourseTeamMembership(userId, courseId);

  const pendingApplication = await prisma.teamJoiningApplication.findFirst({
    where: {
      userId,
      team: { courseId },
    },
    include: { team: { select: { id: true, teamName: true } } },
  });

  const createdTeam = membership?.role === 'TEAM_LEAD' ? membership.team : null;

  return res.status(200).json(
    new ApiResponse(200, 'Course team status fetched', {
      isInTeam: Boolean(membership),
      membership,
      pendingApplication,
      hasCreatedTeam: Boolean(createdTeam),
      canCreateTeam: !membership,
      canJoinTeam: !membership && !pendingApplication,
    }),
  );
});

export const getMyTeams = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as any)?._id as string;

  const memberships = await prisma.teamMember.findMany({
    where: { memberId: userId },
    include: {
      team: {
        include: {
          course: { select: { id: true, courseName: true } },
          members: {
            include: {
              member: { select: { id: true, name: true, email: true } },
            },
          },
          histories: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, 'My teams fetched successfully', memberships));
});

export const createTeam = asyncHandler(async (req: Request, res: Response) => {
  const { teamName, teamDescription } = req.body;
  const courseId = req.params.courseId as string;
  const userId = (req.user as any)?._id as string;

  await assertNotInAnyTeamInCourse(userId, courseId, 'create');
  await assertNoPendingApplicationInCourse(userId, courseId);

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
      approvalStatus: 'PENDING',
      hiring: 'INACTIVE',
    },
  });

  await prisma.teamMember.create({
    data: {
      teamId: team.id,
      memberId: userId,
      role: 'TEAM_LEAD',
    },
  });

  await prisma.history.create({
    data: {
      userId,
      teamId: team.id,
      description: `Team '${teamName}' created by ${(req.user as any)?.name || 'user'}`,
    },
  });


  return res.status(200).json(
    new ApiResponse(
      200,
      'Team created successfully. Waiting for admin approval before it is visible to others.',
      team,
    ),
  );
});

export const getAllTeams = asyncHandler(async (req: Request, res: Response) => {
  const courseId = req.params.courseId as string;
  const userId = (req.user as any)?._id as string;
  const isAdmin = await isRequesterAdmin(userId);

  const teams = await prisma.team.findMany({
    where: {
      courseId,
      ...(isAdmin
        ? {}
        : {
            status: 'ACTIVE',
            OR: [
              { approvalStatus: 'APPROVED' },
              { members: { some: { memberId: userId } } },
            ],
          }),
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
  const teamId = req.params.teamId as string;
  const courseId = req.params.courseId as string;

  const team = await prisma.team.findUnique({
    where: {
      id: teamId,
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

  if (team.courseId !== courseId) {
    throw new ApiError('Team does not belong to this course', 400);
  }

  const userId = (req.user as any)?._id as string;
  const isAdmin = await isRequesterAdmin(userId);
  const isMember = team.members.some((m) => m.memberId === userId);

  if (team.approvalStatus !== 'APPROVED' && !isMember && !isAdmin) {
    throw new ApiError('This team is not available yet', 404);
  }

  if (team.status === 'INACTIVE' && !isMember && !isAdmin) {
    throw new ApiError('Team not found', 404);
  }

  const safeTeam = {
    ...team,
    applications: isMember || isAdmin ? team.applications : [],
    notes: isMember || isAdmin ? team.notes : [],
  };

  return res
    .status(200)
    .json(new ApiResponse(200, 'Team details fetched successfully', safeTeam));
});

export const approveTeamByAdmin = asyncHandler(async (req: Request, res: Response) => {
  const courseId = req.params.courseId as string;
  const teamId = req.params.teamId as string;

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team || team.courseId !== courseId) {
    throw new ApiError('Team not found', 404);
  }

  const updated = await prisma.team.update({
    where: { id: teamId },
    data: {
      approvalStatus: 'APPROVED',
      hiring: 'ACTIVE',
    },
  });

  await prisma.history.create({
    data: {
      teamId,
      description: `Team "${team.teamName}" was approved by an admin`,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, 'Team approved successfully', updated));
});

export const rejectTeamByAdmin = asyncHandler(async (req: Request, res: Response) => {
  const courseId = req.params.courseId as string;
  const teamId = req.params.teamId as string;

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team || team.courseId !== courseId) {
    throw new ApiError('Team not found', 404);
  }

  const updated = await prisma.team.update({
    where: { id: teamId },
    data: {
      approvalStatus: 'REJECTED',
      hiring: 'INACTIVE',
    },
  });

  await prisma.history.create({
    data: {
      teamId,
      description: `Team "${team.teamName}" was rejected by an admin`,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, 'Team rejected', updated));
});

export const openHiring = asyncHandler(async (req: Request, res: Response) => {
  const { teamId } = req.params;

  const existing = await prisma.team.findUnique({ where: { id: `${teamId}` } });
  if (!existing) {
    throw new ApiError('Team not found', 404);
  }
  if (existing.status === 'INACTIVE') {
    throw new ApiError('Blocked teams cannot open hiring', 400);
  }
  if (existing.approvalStatus !== 'APPROVED') {
    throw new ApiError('Team must be approved by an admin before opening hiring', 400);
  }

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

  const existing = await prisma.team.findUnique({ where: { id: `${teamId}` } });
  if (!existing) {
    throw new ApiError('Team not found', 404);
  }

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
  const teamId = req.params.teamId as string;
  const { description } = req.body;
  const userId = (req.user as any)?._id;
  const targetTeam = await prisma.team.findUnique({
    where: { id: teamId },
  });

  if (!targetTeam) {
    throw new ApiError('Team does not exist', 404);
  }

  if (targetTeam.status === 'INACTIVE') {
    throw new ApiError('This team is blocked and not accepting members', 400);
  }

  if (targetTeam.approvalStatus !== 'APPROVED') {
    throw new ApiError('This team is not approved yet', 400);
  }

  if (targetTeam.hiring !== 'ACTIVE') {
    throw new ApiError('This team is not accepting new members', 400);
  }

  const coverLetter =
    typeof description === 'string' ? description.trim() : '';
  if (!coverLetter || coverLetter.length < 10) {
    throw new ApiError('A cover letter of at least 10 characters is required', 400);
  }

  await assertNotInAnyTeamInCourse(userId, targetTeam.courseId, 'join');

  const existingApp = await prisma.teamJoiningApplication.findFirst({
    where: {
      teamId,
      userId: userId,
    },
  });

  if (existingApp) {
    throw new ApiError('You have already applied to join this team', 400);
  }

  await assertNoPendingApplicationInCourse(userId, targetTeam.courseId, teamId);

  const joiningApplication = await prisma.teamJoiningApplication.create({
    data: {
      teamId,
      userId: userId,
      description: coverLetter,
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
  const userId = (req.user as any)?._id as string;

  const membership = await prisma.teamMember.findFirst({
    where: { teamId: `${teamId}`, memberId: userId },
  });
  if (!membership) {
    throw new ApiError('Only team members can view applications', 403);
  }

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

  const team = await prisma.team.findUnique({
    where: { id: `${teamId}` },
    select: { courseId: true, teamName: true },
  });

  if (!team) {
    throw new ApiError('Team does not exist', 404);
  }

  const existingMembership = await findCourseTeamMembership(
    joiningApplication.userId,
    team.courseId,
  );

  if (existingMembership) {
    throw new ApiError(
      'This student is already on another team in this course',
      400,
    );
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



       
