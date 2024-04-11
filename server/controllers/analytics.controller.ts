import { NextFunction, Request, Response } from "express";
import { AsyncErrorHandler } from "../middleware/asyncErrorHandler";
import ErrorHandler from "../config/errorHandler";
import { generateLast12MonthsData } from "../config/analytics.generator";
import userModel from "../models/user.model";
import courseModel from "../models/course.model";
import orderModel from "../models/order.model";



//get user analytics - admin
export const getUserAnalytics = AsyncErrorHandler(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const users = await generateLast12MonthsData(userModel);
        res.status(201).json({
            success:true,
            users

        })
    } catch (error:any) {
        return next(new ErrorHandler(error.message,400));
    }
})


export const getCoursesAnalytics = AsyncErrorHandler(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const courses = await generateLast12MonthsData(courseModel);
        res.status(201).json({
            success:true,
            courses

        })
    } catch (error:any) {
        return next(new ErrorHandler(error.message,400));
    }
})



// get order analytics - admin
export const getOrderAnalytics = AsyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const orders = await generateLast12MonthsData(orderModel);
  
        res.status(200).json({
          success: true,
          orders,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }
    }
  );