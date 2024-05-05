import { NextFunction, Request, Response } from "express";
import { AsyncErrorHandler } from "./asyncErrorHandler";
import ErrorHandler from "../config/errorHandler";
import jwt, { JwtPayload } from 'jsonwebtoken'
import dotenv from 'dotenv'
import { redis } from "../config/redis";
dotenv.config()

export const isAuthenticated = AsyncErrorHandler(async(req:Request,res:Response,next:NextFunction)=>{

    const access_token = req.cookies.access_token as string;
    console.log(access_token)
    if (!access_token) {
      return next(
        new ErrorHandler("Please login to access this resource", 400)
      );
    }


    const decoded = await jwt.verify(access_token, process.env.ACCESS_TOKEN as string) as JwtPayload

    if(!decoded){
        return next(new ErrorHandler("access token is invalid",400));
    }
    // console.log(decoded)
    const user = await redis.get(decoded.id)

    if(!user){
        return next(new ErrorHandler("User not found! Please login to access this resources",400));
    }

    req.user = JSON.parse(user);
    next();
})



// validate user role

export const authorizeRoles = (...roles:string[])=>{

    return (req:Request,res:Response,next:NextFunction)=>{    
        if(!roles.includes(req.user?.role ||'')){
            return next(new ErrorHandler(`Role ${req.user?.role} is not allowed to acces this resource`,403));
        }
        next();
    }
}