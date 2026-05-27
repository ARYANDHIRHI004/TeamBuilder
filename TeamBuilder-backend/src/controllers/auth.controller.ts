import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { prisma } from "../db/db.js";
import type { Request, Response } from "express";

const registerUser = asyncHandler(async (req: Request, res: Response) => {

    const {name, email } = req.body;

    const savedUser = await prisma.user.create({
        data:{
            name: name,
            email:email
        }
    })

    
    return res.status(200).json({
        message: "success",
        data: savedUser
    })
});

export {
    registerUser
}