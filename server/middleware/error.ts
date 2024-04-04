import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../config/errorHandler";


export const ErrorMiddleware = (err:any,req:Request,res:Response, next: NextFunction)=>{
    err.statusCode = err.statusCode ||500;
    err.message = err.message || 'Internal Server Error'


    //MongoDB Wrong Id
    if(err.name==='CastError'){
        const message = `Resource not found. Invalid ${err.path}`
        err = new ErrorHandler(message,400);
    }


    //duplicate key error
    if(err.code ===11000){
        const message =`Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new ErrorHandler(message,400);
    }


    //wront jwt token error
    if(err.name ==='JsonWebTokenError'){
        const message = `Json web token is invalid, try again`
        err = new ErrorHandler(message,400)
    }


    // JWT expire
    if(err.name === "TokenExpiredError"){
        const message = `Json web token is expired, try again`
        err = new ErrorHandler(message,400)
    }


    res.status(err.statusCode).json({
        success:false,
        message:err.message
    })
}