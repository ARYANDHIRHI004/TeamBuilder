import type { Request, Response } from 'express';
import { prisma } from '../db/db.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

async function assertCoursePeerAccess(
  courseId: string,
  userEmail: string,
  peerId: string,
  currentUserId: string,
) {
  if (peerId === currentUserId) {
    throw new ApiError('Cannot message yourself', 400);
  }

  const registration = await prisma.registeredUser.findFirst({
    where: { courseId, userEmail },
  });

  if (!registration) {
    throw new ApiError('You are not enrolled in this course', 403);
  }

  const peer = await prisma.user.findUnique({ where: { id: peerId } });
  if (!peer) {
    throw new ApiError('Peer not found', 404);
  }
  if (peer.accountStatus === 'INACTIVE') {
    throw new ApiError('This user is blocked', 400);
  }

  const peerRegistration = await prisma.registeredUser.findFirst({
    where: { courseId, userEmail: peer.email },
  });

  if (!peerRegistration) {
    throw new ApiError('Peer is not in this course', 400);
  }
}

export const getConversation = asyncHandler(async (req: Request, res: Response) => {
  const courseId = req.params.courseId as string;
  const peerId = req.params.peerId as string;
  const currentUserId = (req.user as any)?._id as string;
  const userEmail = (req.user as any)?.email as string;

  await assertCoursePeerAccess(courseId, userEmail, peerId, currentUserId);

  const messages = await prisma.directMessage.findMany({
    where: {
      courseId,
      OR: [
        { senderId: currentUserId, receiverId: peerId },
        { senderId: peerId, receiverId: currentUserId },
      ],
    },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: { select: { id: true, name: true } },
      receiver: { select: { id: true, name: true } },
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, 'Conversation fetched successfully', messages));
});

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const courseId = req.params.courseId as string;
  const peerId = req.params.peerId as string;
  const { content } = req.body;
  const currentUserId = (req.user as any)?._id as string;
  const userEmail = (req.user as any)?.email as string;

  if (!content || typeof content !== 'string' || !content.trim()) {
    throw new ApiError('Message content is required', 400);
  }

  await assertCoursePeerAccess(courseId, userEmail, peerId, currentUserId);

  const message = await prisma.directMessage.create({
    data: {
      courseId,
      senderId: currentUserId,
      receiverId: peerId,
      content: content.trim(),
    },
    include: {
      sender: { select: { id: true, name: true } },
      receiver: { select: { id: true, name: true } },
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, 'Message sent successfully', message));
});
