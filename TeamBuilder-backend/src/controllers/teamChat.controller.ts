import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { prisma } from '../db/db.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

async function assertTeamMember(teamId: string, userId: string) {
  const membership = await prisma.teamMember.findFirst({
    where: { teamId, memberId: userId },
  });
  if (!membership) {
    throw new ApiError('Only team members can access team chat', 403);
  }
  return membership;
}

async function assertTeamChatReadable(teamId: string, userId: string) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { members: { select: { memberId: true } } },
  });
  if (!team) throw new ApiError('Team not found', 404);

  const isMember = team.members.some((m) => m.memberId === userId);
  const role = await prisma.systemRoles.findFirst({ where: { userId } });
  const isAdmin = role?.role === 'ADMIN' || role?.role === 'SUPERADMIN';

  if (team.status === 'INACTIVE' && !isMember && !isAdmin) {
    throw new ApiError('Team not found', 404);
  }

  if (!isMember && !isAdmin) {
    throw new ApiError('Only team members can access team chat', 403);
  }

  return team;
}

export const listTeamChatMessages = asyncHandler(async (req: Request, res: Response) => {
  const teamId = req.params.teamId as string;
  const userId = (req.user as any)?._id as string;

  await assertTeamChatReadable(teamId, userId);

  const messages = await prisma.teamChatMessage.findMany({
    where: { teamId },
    orderBy: [{ isPinned: 'desc' }, { pinnedAt: 'desc' }, { createdAt: 'asc' }],
    include: {
      sender: { select: { id: true, name: true, email: true } },
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, 'Team chat fetched', messages));
});

export const sendTeamChatMessage = asyncHandler(async (req: Request, res: Response) => {
  const teamId = req.params.teamId as string;
  const userId = (req.user as any)?._id as string;
  const { content } = req.body;

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) throw new ApiError('Team not found', 404);
  if (team.status === 'INACTIVE') {
    throw new ApiError('This team is blocked. Chat is read-only.', 403);
  }

  await assertTeamMember(teamId, userId);

  const text =
    typeof content === 'string' && content.trim() ? content.trim() : null;

  const file = req.file as { filename: string; originalname: string; mimetype: string } | undefined;
  let resourceUrl: string | null = null;
  let resourceName: string | null = null;
  let resourceMime: string | null = null;

  if (file) {
    resourceUrl = `/uploads/team-chat/${file.filename}`;
    resourceName = file.originalname;
    resourceMime = file.mimetype;
  }

  if (!text && !resourceUrl) {
    throw new ApiError('Message text or a resource file is required', 400);
  }

  const message = await prisma.teamChatMessage.create({
    data: {
      teamId,
      senderId: userId,
      content: text,
      resourceUrl,
      resourceName,
      resourceMime,
    },
    include: {
      sender: { select: { id: true, name: true, email: true } },
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, 'Message sent', message));
});

export const pinTeamChatMessage = asyncHandler(async (req: Request, res: Response) => {
  const teamId = req.params.teamId as string;
  const messageId = req.params.messageId as string;
  const userId = (req.user as any)?._id as string;
  const { pinned } = req.body;

  if (typeof pinned !== 'boolean') {
    throw new ApiError('pinned (boolean) is required', 400);
  }

  await assertTeamMember(teamId, userId);

  const existing = await prisma.teamChatMessage.findFirst({
    where: { id: messageId, teamId },
  });
  if (!existing || existing.isDeleted) {
    throw new ApiError('Message not found', 404);
  }

  const updated = await prisma.teamChatMessage.update({
    where: { id: messageId },
    data: {
      isPinned: pinned,
      pinnedAt: pinned ? new Date() : null,
    },
    include: {
      sender: { select: { id: true, name: true, email: true } },
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, pinned ? 'Message pinned' : 'Message unpinned', updated));
});

export const deleteTeamChatMessage = asyncHandler(async (req: Request, res: Response) => {
  const teamId = req.params.teamId as string;
  const messageId = req.params.messageId as string;
  const userId = (req.user as any)?._id as string;

  await assertTeamMember(teamId, userId);

  const existing = await prisma.teamChatMessage.findFirst({
    where: { id: messageId, teamId },
  });
  if (!existing || existing.isDeleted) {
    throw new ApiError('Message not found', 404);
  }

  if (existing.resourceUrl) {
    const relative = existing.resourceUrl.replace(/^\//, '');
    const absolute = path.join(process.cwd(), 'public', relative);
    if (fs.existsSync(absolute)) {
      try {
        fs.unlinkSync(absolute);
      } catch {
        /* ignore */
      }
    }
  }

  const updated = await prisma.teamChatMessage.update({
    where: { id: messageId },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      isPinned: false,
      pinnedAt: null,
      content: null,
      resourceUrl: null,
      resourceName: null,
      resourceMime: null,
    },
    include: {
      sender: { select: { id: true, name: true, email: true } },
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, 'Message deleted', updated));
});
