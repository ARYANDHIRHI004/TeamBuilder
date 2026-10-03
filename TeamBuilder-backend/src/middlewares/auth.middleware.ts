import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../env.js'
import ApiError from '../utils/apiError.js'
import { prisma } from '../db/db.js'

import type { JwtPayload } from 'jsonwebtoken'

export const verifyJwt = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
    const token: string = req.cookies?.accessToken
    console.log(token)

    if (!token) {
      throw new ApiError('Unauthorized request', 400)
    }

    type decodedToken = {
      _id: JwtPayload
      name: JwtPayload
      email: JwtPayload
    }

    const decodedToken = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as {
      _id: string
      name?: string
      email?: string
    }
    console.log(decodedToken)

    const userId = decodedToken._id
    if (userId) {
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { accountStatus: true },
      })
      if (dbUser?.accountStatus === 'INACTIVE') {
        throw new ApiError('Your account has been blocked. Contact an administrator.', 403)
      }
    }

    req.user = decodedToken
    next()

}

type roles = 'ADMIN' | 'SUPERADMIN' | 'STUDENT'

export const systemRoles = (role: roles[] = []) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as any)?._id
    console.log(userId)

    const userRole = await prisma.systemRoles.findFirst({
      where: {
        userId,
      },
    })

    if (!userRole) {
      throw new ApiError('you are not allowed to do anything', 400)
    }

    const roles = userRole.role
    if (req.user) {
      (req.user as any).role = role
    }
    if (!role.includes(roles)) {
      throw new ApiError('unauthorized request', 400)
    }
    next()
  }
}
