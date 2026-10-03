import type { Request, Response } from 'express';
import { prisma } from '../db/db.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const givenById = (req.user as any)?._id as string;
  const { review, givenToUserId, givenToTeamId } = req.body;

  if (!review || typeof review !== 'string' || !review.trim()) {
    throw new ApiError('Feedback text is required', 400);
  }

  if (!givenToUserId && !givenToTeamId) {
    throw new ApiError('Provide either a peer (user) or a team to review', 400);
  }

  if (givenToUserId && givenToTeamId) {
    throw new ApiError('Review either a user or a team, not both', 400);
  }

  if (givenToUserId === givenById) {
    throw new ApiError('You cannot review yourself', 400);
  }

  if (givenToUserId) {
    const target = await prisma.user.findUnique({ where: { id: givenToUserId } });
    if (!target) throw new ApiError('User not found', 404);
    if (target.accountStatus === 'INACTIVE') {
      throw new ApiError('Cannot review a blocked user', 400);
    }
  }

  if (givenToTeamId) {
    const team = await prisma.team.findUnique({ where: { id: givenToTeamId } });
    if (!team) throw new ApiError('Team not found', 404);
  }

  const created = await prisma.review.create({
    data: {
      review: review.trim(),
      givenById,
      givenToUserId: givenToUserId || null,
      givenToTeamId: givenToTeamId || null,
    },
    include: {
      givenBy: { select: { id: true, name: true, email: true } },
      givenToUser: { select: { id: true, name: true, email: true } },
      givenToTeam: { select: { id: true, teamName: true } },
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, 'Feedback submitted successfully', created));
});

export const getMyReviews = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as any)?._id as string;

  const [given, received] = await Promise.all([
    prisma.review.findMany({
      where: { givenById: userId },
      include: {
        givenToUser: { select: { id: true, name: true } },
        givenToTeam: { select: { id: true, teamName: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.review.findMany({
      where: { givenToUserId: userId },
      include: {
        givenBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return res.status(200).json(
    new ApiResponse(200, 'Reviews fetched successfully', { given, received }),
  );
});

export const getReviewsForUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.userId as string;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError('User not found', 404);

  const [given, received] = await Promise.all([
    prisma.review.findMany({
      where: { givenById: userId },
      include: {
        givenToUser: { select: { id: true, name: true } },
        givenToTeam: { select: { id: true, teamName: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.review.findMany({
      where: { givenToUserId: userId },
      include: {
        givenBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return res.status(200).json(
    new ApiResponse(200, 'User reviews fetched', { given, received }),
  );
});

export const getAllReviewsAdmin = asyncHandler(async (req: Request, res: Response) => {
  const reviews = await prisma.review.findMany({
    include: {
      givenBy: { select: { id: true, name: true, email: true } },
      givenToUser: { select: { id: true, name: true, email: true } },
      givenToTeam: { select: { id: true, teamName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, 'All feedback fetched', reviews));
});
