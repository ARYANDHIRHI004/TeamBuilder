import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError';
import ApiResponse from '../utils/apiResponse';
import fs from 'fs';
import { parse } from 'csv-parse';

type RegistrationRow = {
  id: string;
  userEmail: string;
  createdAt: Date;
  courseId: string;
  course?: { courseName: string };
};

function displayNameFromEmail(email: string) {
  const local = email.split('@')[0] || email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/** Dev helper: treat pre-registered emails as if they completed Google sign-in. */
async function ensureMockGoogleUserForEmail(email: string) {
  const normalized = email.trim().toLowerCase();

  const existing = await prisma.user.findFirst({
    where: { email: { equals: normalized, mode: 'insensitive' } },
  });

  if (existing) {
    if (!existing.isEmailVerified) {
      return prisma.user.update({
        where: { id: existing.id },
        data: { isEmailVerified: true },
      });
    }
    return existing;
  }

  return prisma.user.create({
    data: {
      email: normalized,
      name: displayNameFromEmail(normalized),
      isEmailVerified: true,
    },
  });
}

async function ensureMockGoogleUsersForEmails(emails: string[]) {
  const unique = Array.from(
    new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean)),
  );
  for (const email of unique) {
    await ensureMockGoogleUserForEmail(email);
  }
}

async function loadUsersAndTeamsForRegistrations(registrations: RegistrationRow[]) {
  const emails = Array.from(
    new Set(registrations.map((r) => r.userEmail.trim().toLowerCase())),
  );

  const users = emails.length
    ? await prisma.user.findMany({
        where: {
          OR: emails.map((email) => ({
            email: { equals: email, mode: 'insensitive' },
          })),
        },
      })
    : [];

  const userByEmail = new Map(users.map((u) => [u.email.toLowerCase(), u]));
  const courseIds = Array.from(new Set(registrations.map((r) => r.courseId)));

  const teamMemberships = users.length
    ? await prisma.teamMember.findMany({
        where: {
          memberId: { in: users.map((u) => u.id) },
          team: { courseId: { in: courseIds } },
        },
        include: { team: { select: { teamName: true, courseId: true } } },
      })
    : [];

  return { userByEmail, teamMemberships };
}

function mapRegistrationsToPeers(
  registrations: RegistrationRow[],
  userByEmail: Map<string, { id: string; name: string; email: string; isEmailVerified: boolean; createdAt: Date; accountStatus: string }>,
  teamMemberships: Array<{
    memberId: string;
    team: { teamName: string; courseId: string };
  }>,
  options?: { excludeUserId?: string; excludeEmail?: string },
) {
  const excludeEmail = options?.excludeEmail?.toLowerCase();
  const excludeUserId = options?.excludeUserId;

  const peers: any[] = [];

  for (const reg of registrations) {
    const emailKey = reg.userEmail.trim().toLowerCase();
    if (excludeEmail && emailKey === excludeEmail) continue;

    const user = userByEmail.get(emailKey);
    // Only peers that are registered for the course AND have a User row (mock / real Google).
    if (!user) continue;
    if (user.accountStatus === 'INACTIVE') continue;
    if (excludeUserId && user.id === excludeUserId) continue;

    const team = teamMemberships.find(
      (m) => m.memberId === user.id && m.team.courseId === reg.courseId,
    );

    peers.push({
      id: user.id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      courseId: reg.courseId,
      courseName: reg.course?.courseName,
      teamName: team?.team.teamName ?? null,
      joinedAt: reg.createdAt,
      createdAt: user.createdAt,
      status: 'Active',
    });
  }

  return peers;
}

export const createCourse = asyncHandler(
  async (req: Request, res: Response, nest: NextFunction) => {
    const { courseName, courseDescription } = req.body;
    const userId = (req.user as any)?._id;

    const existedCourse = await prisma.course.findFirst({
      where: {
        courseName,
      },
    });

    if (existedCourse) {
      throw new ApiError('Course Already Exist', 400);
    }

    const course = await prisma.course.create({
      data: {
        courseName,
        courseDescription,
        createdBy: userId,
      },
    });

    if (!course) {
      throw new ApiError('Something went wrong while creating course', 500);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, 'Course Created successfully', course));
  },
);

export const getAllCourse = asyncHandler(
  async (req: Request, res: Response, nest: NextFunction) => {
    const allCourses = await prisma.course.findMany({
      include: {
        creater: { select: { id: true, name: true, email: true } },
        _count: { select: { registeredUsers: true, teams: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, 'All courses fetched successfully', allCourses),
      );
  },
);

export const getAllEnroledCourse = asyncHandler(
  async (req: Request, res: Response, nest: NextFunction) => {
    const userEmail = (req.user as any)?.email;

    const myEnroledCourses = await prisma.registeredUser.findMany({
      where: {
        userEmail,
      },
      include: {
        course: true,
      },
    });

    if (!myEnroledCourses) {
      throw new ApiError('No Enroled Courses, what are you wating for', 500);
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          'All courses fetched successfully',
          myEnroledCourses,
        ),
      );
  },
);

export const getCourseById = asyncHandler(
  async (req: Request, res: Response, nest: NextFunction) => {
    const courseId = req.params.courseId as string;

    if (!courseId) {
      throw new ApiError('Invalid Course Id', 400);
    }

    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
      },
    });

    if (!course) {
      throw new ApiError('no such course exist', 500);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, 'All course fetched successfully', course));
  },
);

export const addStudentDetails = asyncHandler(
  async (req: Request, res: Response, nest: NextFunction) => {
    const courseId = req.params.courseId as string;

    if (!courseId) {
      throw new ApiError('Course ID is required', 400);
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new ApiError('Course does not exist', 404);
    }

    if (!req.file) {
      throw new ApiError('CSV file is required. Please upload a file with field name "file"', 400);
    }

    const csvContent = req.file.buffer.toString('utf-8');
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = csvContent.match(emailRegex) || [];

    const extractedEmails = Array.from(
      new Set(matches.map((email) => email.trim().toLowerCase()))
    );

    if (extractedEmails.length === 0) {
      throw new ApiError('No valid email addresses found in the uploaded CSV file', 400);
    }

    const existingRegistrations = await prisma.registeredUser.findMany({
      where: {
        courseId,
        userEmail: { in: extractedEmails },
      },
      select: { userEmail: true },
    });

    const existingEmailSet = new Set(
      existingRegistrations.map((r) => r.userEmail.toLowerCase())
    );

    const newEmailsToRegister = extractedEmails.filter(
      (email) => !existingEmailSet.has(email)
    );

    let registeredUsers: any[] = [];
    if (newEmailsToRegister.length > 0) {
      const dataToInsert = newEmailsToRegister.map((email) => ({
        courseId,
        userEmail: email,
      }));

      registeredUsers = await prisma.registeredUser.createManyAndReturn({
        data: dataToInsert,
      });
    }

    await ensureMockGoogleUsersForEmails(extractedEmails);

    return res.status(200).json(
      new ApiResponse(200, 'Student details uploaded and registered successfully', {
        totalParsed: extractedEmails.length,
        addedCount: registeredUsers.length,
        skippedCount: extractedEmails.length - newEmailsToRegister.length,
        registeredUsers,
      })
    );
  },
);

export const addStudentManual = asyncHandler(
  async (req: Request, res: Response, nest: NextFunction) => {
    const courseId = req.params.courseId as string;

    if (!courseId) {
      throw new ApiError('Course ID is required', 400);
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new ApiError('Course does not exist', 404);
    }

    let rawEmails: string[] = [];
    if (Array.isArray(req.body.emails)) {
      rawEmails = req.body.emails;
    } else if (typeof req.body.email === 'string') {
      rawEmails = [req.body.email];
    } else if (typeof req.body.userEmail === 'string') {
      rawEmails = [req.body.userEmail];
    } else if (Array.isArray(req.body.students)) {
      rawEmails = req.body.students
        .map((s: any) => (typeof s === 'string' ? s : s?.email || s?.userEmail))
        .filter(Boolean);
    }

    if (!rawEmails || rawEmails.length === 0) {
      throw new ApiError('Please provide student email(s) in the request body', 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = Array.from(
      new Set(
        rawEmails
          .map((e) => e.trim().toLowerCase())
          .filter((e) => emailRegex.test(e))
      )
    );

    if (validEmails.length === 0) {
      throw new ApiError('No valid email addresses provided', 400);
    }

    const existingRegistrations = await prisma.registeredUser.findMany({
      where: {
        courseId,
        userEmail: { in: validEmails },
      },
      select: { userEmail: true },
    });

    const existingEmailSet = new Set(
      existingRegistrations.map((r) => r.userEmail.toLowerCase())
    );

    const newEmailsToRegister = validEmails.filter(
      (email) => !existingEmailSet.has(email)
    );

    let registeredUsers: any[] = [];
    if (newEmailsToRegister.length > 0) {
      const dataToInsert = newEmailsToRegister.map((email) => ({
        courseId,
        userEmail: email,
      }));

      registeredUsers = await prisma.registeredUser.createManyAndReturn({
        data: dataToInsert,
      });
    }

    await ensureMockGoogleUsersForEmails(validEmails);

    return res.status(200).json(
      new ApiResponse(200, 'Student details registered manually successfully', {
        totalProvided: validEmails.length,
        addedCount: registeredUsers.length,
        skippedCount: validEmails.length - newEmailsToRegister.length,
        registeredUsers,
      })
    );
  },

);

export const getPeersAccount = asyncHandler(
  async (req: Request, res: Response, nest: NextFunction) => {
    const courseId = req.params.courseId as string;
    const currentUserId = (req.user as any)?._id as string | undefined;
    const currentUserEmail = (req.user as any)?.email as string | undefined;

    const registrations = await prisma.registeredUser.findMany({
      where: { courseId },
      orderBy: { createdAt: 'asc' },
    });

    const { userByEmail, teamMemberships } =
      await loadUsersAndTeamsForRegistrations(registrations);

    const peers = mapRegistrationsToPeers(
      registrations,
      userByEmail,
      teamMemberships,
      {
        excludeUserId: currentUserId,
        excludeEmail: currentUserEmail,
      },
    );

    return res
      .status(200)
      .json(new ApiResponse(200, 'Peers fetched successfully', peers));
  },
);

export const getAllPeersForUser = asyncHandler(
  async (req: Request, res: Response, nest: NextFunction) => {
    const userEmail = (req.user as any)?.email as string;
    const currentUserId = (req.user as any)?._id as string;

    const systemRole = await prisma.systemRoles.findFirst({
      where: { userId: currentUserId },
    });
    const isAdmin =
      systemRole?.role === 'ADMIN' || systemRole?.role === 'SUPERADMIN';

    let allRegistrations: RegistrationRow[];

    if (isAdmin) {
      allRegistrations = await prisma.registeredUser.findMany({
        include: { course: true },
        orderBy: { createdAt: 'asc' },
      });
    } else {
      const myRegistrations = await prisma.registeredUser.findMany({
        where: {
          userEmail: { equals: userEmail, mode: 'insensitive' },
        },
        include: { course: true },
      });

      const courseIds = myRegistrations.map((r) => r.courseId);
      if (courseIds.length === 0) {
        return res
          .status(200)
          .json(new ApiResponse(200, 'No peers found', []));
      }

      allRegistrations = await prisma.registeredUser.findMany({
        where: { courseId: { in: courseIds } },
        include: { course: true },
        orderBy: { createdAt: 'asc' },
      });
    }

    const { userByEmail, teamMemberships } =
      await loadUsersAndTeamsForRegistrations(allRegistrations);

    const peers = mapRegistrationsToPeers(
      allRegistrations,
      userByEmail,
      teamMemberships,
      isAdmin
        ? undefined
        : {
            excludeUserId: currentUserId,
            excludeEmail: userEmail,
          },
    );

    return res
      .status(200)
      .json(new ApiResponse(200, 'All peers fetched successfully', peers));
  },
);

/** Create User rows for every RegisteredUser email that has not signed in yet. */
export const syncRegisteredStudentsToUsers = asyncHandler(
  async (req: Request, res: Response, nest: NextFunction) => {
    const registrations = await prisma.registeredUser.findMany();
    const emails = Array.from(
      new Set(registrations.map((r) => r.userEmail.trim().toLowerCase())),
    );

    let created = 0;
    let updated = 0;

    for (const email of emails) {
      const before = await prisma.user.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } },
      });

      await ensureMockGoogleUserForEmail(email);

      const after = await prisma.user.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } },
      });

      if (!before && after) created += 1;
      else if (before && !before.isEmailVerified && after?.isEmailVerified) updated += 1;
    }

    return res.status(200).json(
      new ApiResponse(200, 'Registered students synced to mock Google users', {
        totalRegistrations: registrations.length,
        uniqueEmails: emails.length,
        created,
        updated,
      }),
    );
  },
);
