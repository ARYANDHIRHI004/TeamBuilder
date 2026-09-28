import asyncHandler from "../utils/asyncHandler.js";
import type { Request, Response } from "express";  
import { prisma } from "../db/db.js";
import ApiResponse from "../utils/apiResponse.js";

export const getUsersHistory = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.userId || (req.user as any)?._id;

  const history = await prisma.history.findMany({
    where: {
      OR: [
        { userId: userId },
        { team: { members: { some: { memberId: userId } } } }
      ]
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      team: {
        select: {
          teamName: true
        }
      }
    }
  });

  return res.status(200).json(
    new ApiResponse(200, "User history fetched successfully", history)
  );
});




