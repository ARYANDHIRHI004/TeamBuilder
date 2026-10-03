import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { prisma } from '../db/db.js';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../env.js';
import ApiError from '../utils/apiError.js';

const generateAccessTokenAndRefreshToken = (user: any): any => {
  const accessToken = jwt.sign(
    {
      _id: user.id,
      name: user.name,
      email: user.email,
    },
    env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: '1d',
    },
  );

  const refreshToken = jwt.sign(
    {
      _id: user.id,
      name: user.name,
      email: user.email,
    },
    env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: '10d',
    },
  );
  return { accessToken, refreshToken };
};

const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, address } = req.body;

  const savedUser = await prisma.user.create({
    data: {
      name: name,
      email: email,
      address: 'aryan',
      isEmailVerified: false,
    },
  });

  return res.status(200).json({
    message: 'success',
    data: savedUser,
  });
});

const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as any;

  // ── Enrollment gate ────────────────────────────────────────────────────────
  // Check whether this user has an ADMIN or SUPERADMIN system role.
  // If they do, let them through unconditionally.
  // If they don't, they MUST have been pre-registered by an admin in at least
  // one course (i.e. have a row in RegisteredUser matching their email).

  const systemRole = await prisma.systemRoles.findFirst({
    where: { userId: user.id },
  });

  const isAdmin =
    systemRole?.role === 'ADMIN' || systemRole?.role === 'SUPERADMIN';

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (dbUser?.accountStatus === 'INACTIVE') {
    res
      .clearCookie('accessToken', { httpOnly: true, path: '/' })
      .clearCookie('refreshToken', { httpOnly: true, path: '/' })
      .status(403)
      .redirect('http://localhost:5173/unauthorized?reason=blocked');
    return;
  }

  if (!isAdmin) {
    const registration = await prisma.registeredUser.findFirst({
      where: { userEmail: user.email },
    });

    if (!registration) {
      // Clear any partial cookies and redirect to an error page
      res
        .clearCookie('accessToken', { httpOnly: true, path: '/' })
        .clearCookie('refreshToken', { httpOnly: true, path: '/' })
        .status(403)
        .redirect(
          'http://localhost:5173/unauthorized?reason=not_registered',
        );
      return;
    }
  }
  // ── End enrollment gate ───────────────────────────────────────────────────

  const { accessToken, refreshToken } =
    generateAccessTokenAndRefreshToken(user);

  const cookieOptions = {
    httpOnly: true,
    path: '/',
  };

  res
    .status(200)
    .cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .redirect('http://localhost:5173/dashboard');
});

const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  const cookieOptions = {
    httpOnly: true,
    path: '/',
  };

  return res
    .status(200)
    .clearCookie('accessToken', cookieOptions)
    .clearCookie('refreshToken', cookieOptions)
    .json(new ApiResponse(200, 'Logged out successfully', null));
});

const getAdmins = asyncHandler(async (req: Request, res: Response) => {
  const roles = await prisma.systemRoles.findMany({
    where: { role: { in: ['ADMIN', 'SUPERADMIN'] } },
    include: {
      roleOf: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      },
    },
  });

  const admins = roles.map((r) => ({
    id: r.roleOf.id,
    name: r.roleOf.name,
    email: r.roleOf.email,
    role: r.role,
    status: 'Active',
    joinedAt: r.roleOf.createdAt,
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, 'Admins fetched successfully', admins));
});

const getMyReviews = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as any)?._id as string;

  const [received, given] = await Promise.all([
    prisma.review.findMany({
      where: { givenToUserId: userId },
      include: {
        givenBy: { select: { id: true, name: true } },
        givenToTeam: { select: { id: true, teamName: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.review.findMany({
      where: { givenById: userId },
      include: {
        givenToUser: { select: { id: true, name: true } },
        givenToTeam: { select: { id: true, teamName: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return res.status(200).json(
    new ApiResponse(200, 'Reviews fetched successfully', { received, given }),
  );
});

const getMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as any)?._id;


  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      roles: true,
    },
  });
  if (!user) {
    throw new ApiError('User not found', 400);
  }

  if (user.accountStatus === 'INACTIVE') {
    throw new ApiError('Your account has been blocked. Contact an administrator.', 403);
  }

  return res
    .status(200)

    .json(new ApiResponse(200, 'user Loged In successfully', user));
});

const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const targetUserId = req.params.userId as string;
  const requesterId = (req.user as any)?._id as string;

  if (!targetUserId) {
    throw new ApiError('User id is required', 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: { roles: true },
  });

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  const isSelf = targetUserId === requesterId;
  const requesterRole = await prisma.systemRoles.findFirst({
    where: { userId: requesterId },
  });
  const isAdmin =
    requesterRole?.role === 'ADMIN' || requesterRole?.role === 'SUPERADMIN';

  return res.status(200).json(
    new ApiResponse(200, 'Profile fetched successfully', {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      isEmailVerified: user.isEmailVerified,
      accountStatus: user.accountStatus,
      roles: user.roles.map((r) => r.role),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      canEdit: isSelf,
      isAdminView: isAdmin && !isSelf,
    }),
  );
});

const updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as any)?._id as string;
  const { name, address } = req.body;

  const data: { name?: string; address?: string | null } = {};

  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) {
      throw new ApiError('Name must be a non-empty string', 400);
    }
    data.name = name.trim();
  }

  if (address !== undefined) {
    if (address !== null && typeof address !== 'string') {
      throw new ApiError('Address must be a string', 400);
    }
    data.address = address === null ? null : address.trim();
  }

  if (Object.keys(data).length === 0) {
    throw new ApiError('No valid fields to update', 400);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
    include: { roles: true },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, 'Profile updated successfully', updated));
});

export {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  getAdmins,
  getMyReviews,
  getUserProfile,
  updateMyProfile,
};
