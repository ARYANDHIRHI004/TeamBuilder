import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { prisma } from "../db/db.js";
import type { Request, Response } from "express";

const registerUser = asyncHandler(async (req: Request, res: Response) => {

    const {name, email, address } = req.body;

    const savedUser = await prisma.user.create({
        data:{ 
            name: name,
            email:email,
            address:"aryan",
            isEmailVerified: false
        }
    })

     
    return res.status(200).json({
        message: "success",
        data: savedUser
    })
});

const loginUser = asyncHandler(async (req: Request, res: Response) => {

    res.json({
    //   token,
      user: req.user,
    name:"aryan"
    });

});

export {
    registerUser,
    loginUser
}