import { prisma } from "../db/db.js";
import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import type { Request, Response } from "express";

export const createTeam = asyncHandler(async (req: Request, res: Response) => {
    const {teamName, teamDescription} = req.body;
    const {courseId} = req.params

    console.log(teamName, teamDescription, courseId)

    const existedTeam = await prisma.team.findUnique({
        where:{
            teamName,
            courseId: `${courseId}`
        }
    })
    
    if(existedTeam){
        throw new ApiError("Team already exist", 400);
    }

    const team = await prisma.team.create({
        data:{
            teamName,
            teamDescription,
            courseId: `${courseId}`
        }
    })
    return res.status(200).json(
        new ApiResponse(200, "Team created successfully", team)
    )

})

export const getAllTeams = asyncHandler(async (req: Request, res: Response) => {
  
    const {courseId} = req.params


    const teams = await prisma.team.findMany({
        where:{
            courseId: `${courseId}`
        }
    })
    
    if(!teams){
        throw new ApiError("No team are registered", 400);
    }

    return res.status(200).json(
        new ApiResponse(200, "Team created successfully", teams)
    )

})

export const getTeamById = asyncHandler(async (req: Request, res: Response) => {
  
    const {courseId, teamId} = req.params


    const team = await prisma.team.findFirst({
        where:{
            courseId: `${courseId}`,
            id: `${teamId}`
        }
    })
    
    if(!team){
        throw new ApiError("No such team", 400);
    }

    return res.status(200).json(
        new ApiResponse(200, "Team created successfully", team)
    )

})