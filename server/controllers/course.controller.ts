import cloudinary from 'cloudinary'
import { AsyncErrorHandler } from '../middleware/asyncErrorHandler'
import { NextFunction, Request, Response } from 'express'
import ErrorHandler from '../config/errorHandler'
import { createCourse } from '../services/course.service'
import courseModel from '../models/course.model'
import { redis } from '../config/redis'


//upload course
export const uploadCourse = AsyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;

        if (thumbnail) {
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: 'lms_courses'
            })

            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        }
        createCourse(data, res, next);
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})


//edit course
export const editCourse = AsyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {

    try {

        const data = req.body;

        // const thumbnail = req.body;

        // if (thumbnail) {
        //     await cloudinary.v2.uploader.destroy(thumbnail.public_id)

        //     const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
        //         folder: "lms_courses"
        //     })

        //     data.thumbnail = {
        //         public_id: myCloud.public_id,
        //         url: myCloud.secure_url
        //     }

        // }

        const courseId = req.params.id;

        const course = await courseModel.findByIdAndUpdate(courseId, { $set: data }, { new: true })

        res.status(201).json({ success: true, course })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }

})


//get single course - without purchase

export const getSingleCourse =  AsyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
try {

    const courseId = req.params.id;
    const isCacheExist = await redis.get(courseId);

    if(isCacheExist){
        const course = JSON.parse(isCacheExist)
        res.status(201).json({
            success:true,
            course
        })
    }else{

        
        const course = await courseModel.findById(req.params.id).select('-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links')  
        await redis.set(courseId,JSON.stringify(course))
        res.status(201).json({
            success:true,
            course
        })
    }
        
} catch (error: any) {
    return next(new ErrorHandler(error.message, 400))
}

})

// get all courses - without purchase
export const getAllCourse =  AsyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const isCached = await redis.get("allCourses")
        if(isCached){
            const courses = JSON.parse(isCached)
            res.status(201).json({
                success:true,
                courses
            })

        }
        else{

            const courses = await courseModel.find().select('-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links')  
            await redis.set("allCourses",JSON.stringify(courses))
            res.status(201).json({
                success:true,
                courses
            })
        }
            
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
    
    })