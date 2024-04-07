import cloudinary from 'cloudinary'
import { AsyncErrorHandler } from '../middleware/asyncErrorHandler'
import { NextFunction, Request, Response } from 'express'
import ErrorHandler from '../config/errorHandler'
import { createCourse } from '../services/course.service'


//upload course
export const uploadCourse = AsyncErrorHandler(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        
        if(thumbnail){
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail,{
                folder:'lms_courses'
            })

            data.thumbnail = {
                public_id:  myCloud.public_id,
                url:myCloud.secure_url
            }
        }
        createCourse(data,res,next);
    } catch (error:any) {
        return next(new ErrorHandler(error.message,400));
    }
})