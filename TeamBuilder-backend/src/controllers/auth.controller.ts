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

  if (!isAdmin) {
    const registration = await prisma.registeredUser.findFirst({
      where: { userEmail: user.email },
    });

    if (!registration) {
      // Clear any partial cookies and redirect to an error page
      res
        .clearCookie('accessToken')
        .clearCookie('refreshToken')
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

  const options = {
    httpOnly: true,
  };

  res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .redirect('http://localhost:5173/dashboard');
});

const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  const userId =( req.user as any)?._id;

  const options = {
    httpOnly: true,
  };

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json({
      name: 'Aryan',
    });
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

  return res
    .status(200)

    .json(new ApiResponse(200, 'user Loged In successfully', user));
});

export { registerUser, loginUser, getMe, logoutUser };
