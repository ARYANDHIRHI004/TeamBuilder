import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError';
import ApiResponse from '../utils/apiResponse';
import fs from 'fs';
import { parse } from 'csv-parse';

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
    const allCourses = await prisma.course.findMany();

    if (!allCourses) {
      throw new ApiError('No sourses', 500);
    }

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

    const registrations = await prisma.registeredUser.findMany({
      where: {
        courseId: courseId,
      },
    });

    const emails = registrations.map((registration) => registration.userEmail);

    console.log(emails)

    const users = await prisma.user.findMany({
      where:{
        email: {
          in: emails
        }
      }
    })

    return res
      .status(200)
      .json(new ApiResponse(200, 'All course fetched successfully', users));
  },
);
