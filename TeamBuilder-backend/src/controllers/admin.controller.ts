import type { Request, Response } from 'express';
import { prisma } from '../db/db.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getAllStudentsAdmin = asyncHandler(async (req: Request, res: Response) => {
  const registrations = await prisma.registeredUser.findMany({
    include: { course: { select: { id: true, courseName: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const emails = Array.from(
    new Set(registrations.map((r) => r.userEmail.trim().toLowerCase())),
  );

  const users = await prisma.user.findMany({
    where: {
      OR: emails.map((email) => ({
        email: { equals: email, mode: 'insensitive' as const },
      })),
    },
    include: {
      roles: true,
      teamMemberships: {
        include: { team: { select: { id: true, teamName: true, courseId: true, status: true } } },
      },
    },
  });

  const adminUserIds = new Set(
    (
      await prisma.systemRoles.findMany({
        where: { role: { in: ['ADMIN', 'SUPERADMIN'] } },
        select: { userId: true },
      })
    ).map((r) => r.userId),
  );

  const students = registrations
    .map((reg) => {
      const user = users.find(
        (u) => u.email.toLowerCase() === reg.userEmail.toLowerCase(),
      );
      if (user && adminUserIds.has(user.id)) return null;

      return {
        registrationId: reg.id,
        courseId: reg.courseId,
        courseName: reg.course.courseName,
        userEmail: reg.userEmail,
        joinedAt: reg.createdAt,
        userId: user?.id ?? null,
        name: user?.name ?? reg.userEmail.split('@')[0],
        accountStatus: user?.accountStatus ?? 'ACTIVE',
        hasAccount: Boolean(user),
        teams: user?.teamMemberships?.filter((m) => m.team.courseId === reg.courseId) ?? [],
      };
    })
    .filter(Boolean);

  return res
    .status(200)
    .json(new ApiResponse(200, 'Students fetched successfully', students));
});

export const setUserBlockStatus = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const { blocked } = req.body;

  if (typeof blocked !== 'boolean') {
    throw new ApiError('blocked (boolean) is required', 400);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { accountStatus: blocked ? 'INACTIVE' : 'ACTIVE' },
  });

  return res.status(200).json(
    new ApiResponse(200, blocked ? 'User blocked' : 'User unblocked', user),
  );
});

export const setTeamBlockStatus = asyncHandler(async (req: Request, res: Response) => {
  const teamId = req.params.teamId as string;
  const { blocked } = req.body;

  if (typeof blocked !== 'boolean') {
    throw new ApiError('blocked (boolean) is required', 400);
  }

  const team = await prisma.team.update({
    where: { id: teamId },
    data: {
      status: blocked ? 'INACTIVE' : 'ACTIVE',
      ...(blocked ? { hiring: 'INACTIVE' } : {}),
    },
  });

  return res.status(200).json(
    new ApiResponse(200, blocked ? 'Team blocked' : 'Team unblocked', team),
  );
});

export const getAllTeamsAdmin = asyncHandler(async (req: Request, res: Response) => {
  const teams = await prisma.team.findMany({
    include: {
      course: { select: { id: true, courseName: true } },
      members: {
        include: { member: { select: { id: true, name: true, email: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, 'Teams fetched successfully', teams));
});
