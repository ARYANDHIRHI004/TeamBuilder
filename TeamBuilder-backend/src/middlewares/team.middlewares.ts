import type {Request,Response, NextFunction } from "express"
import { prisma } from "../db/db.js"
import ApiError from "../utils/apiError.js"



type roles = 'TEAM_LEAD' | 'MEMBER';

export const teamRoles = (roles: roles[] = []) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const memberId = req.user?._id

    const teamMember = await prisma.teamMember.findFirst({
      where: {
        memberId,
      },
    })

    if (!teamMember) {
      throw new ApiError('you are not allowed to do anything', 400)
    }

    const role = teamMember.role

    if (!roles.includes(role)) {
      throw new ApiError('unauthorized request', 400)
    }
    next()
  }
}