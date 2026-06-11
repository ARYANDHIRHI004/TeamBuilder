import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../db/db.js'
import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/apiError'
import ApiResponse from '../utils/apiResponse'
import fs from 'fs'
import { parse } from 'csv-parse'

export const createCourse = asyncHandler(
  async (req: Request, res: Response, nest: NextFunction) => {
    const { courseName, courseDescription } = req.body
    const userId = req.user?._id

    const existedCourse = await prisma.course.findFirst({
      where: {
        courseName,
      },
    })

    if (existedCourse) {
      throw new ApiError('Course Already Exist', 400)
    }

    const course = await prisma.course.create({
      data: {
        courseName,
        courseDescription,
        createdBy: userId,
      },
    })

    if (!course) {
      throw new ApiError('Something went wrong while creating course', 500)
    }

    return res
      .status(200)
      .json(new ApiResponse(200, 'Course Created successfully', course))
  },
)

export const getAllCourse = asyncHandler(
  async (req: Request, res: Response, nest: NextFunction) => {
    const allCourses = await prisma.course.findMany()

    if (!allCourses) {
      throw new ApiError('No sourses', 500)
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, 'All courses fetched successfully', allCourses),
      )
  },
)

export const getAllEnroledCourse = asyncHandler(
  async (req: Request, res: Response, nest: NextFunction) => {
    const userEmail = req.user?.email

    const myEnroledCourses = await prisma.registeredUser.findMany({
      where: {
        userEmail,
      },
      include: {
        course: true,
      },
    })

    if (!myEnroledCourses) {
      throw new ApiError('No Enroled Courses, what are you wating for', 500)
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          'All courses fetched successfully',
          myEnroledCourses,
        ),
      )
  },
)

export const getCourseById = asyncHandler(
  async (req: Request, res: Response, nest: NextFunction) => {
    const { courseId } = req.params

    if (!courseId) {
      throw new ApiError('Invalid Course Id', 400)
    }

    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
      },
    })

    if (!course) {
      throw new ApiError('no such course exist', 500)
    }

    return res
      .status(200)
      .json(new ApiResponse(200, 'All course fetched successfully', course))
  },
)

export const addStudentDetails = asyncHandler(
  async (req: Request, res: Response, nest: NextFunction) => {
    const { courseId } = req.params
    const parser = parse({ columns: true })

    type resultObject = {
      userEmail: string
      courseId: string
    }
    const results:resultObject[] = []

    fs.createReadStream('public/studentRecords.csv')
      .pipe(parser)
      .on('data', (data: any) => results.push({ ...data, courseId }))
      .on('end', async () => {
        console.log('CSV successfully processed:')
        console.log(results)
        const registeredUsers = await prisma.registeredUser.createManyAndReturn(
          {
            data: results,
          },
        )
        return res
          .status(200)
          .json(
            new ApiResponse(
              200,
              'All course fetched successfully',
              registeredUsers,
            ),
          )
      })
      .on('error', (error: any) => {
        console.error('Error reading CSV:', error.message)
      })
  },
)
