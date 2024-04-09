import cloudinary from 'cloudinary'
import { AsyncErrorHandler } from '../middleware/asyncErrorHandler'
import { NextFunction, Request, Response } from 'express'
import ErrorHandler from '../config/errorHandler'
import { createCourse } from '../services/course.service'
import courseModel from '../models/course.model'


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