import type { Request,Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { env } from "../env.js"

export const verifyJwt = async(req:Request, res:Response, next:NextFunction)=>{
    try {
        const token = req.cookies?.accessToken
        console.log(token);

        const decodedToken = jwt.verify(token,env.ACCESS_TOKEN_SECRET as string)

        // if(req.user) req.user.id = decodedToken._id;

        next();
        
    } catch (error) {
        
    }
}