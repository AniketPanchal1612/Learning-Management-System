import cloudinary from 'cloudinary'
import { AsyncErrorHandler } from '../middleware/asyncErrorHandler'
import { NextFunction, Request, Response } from 'express'
import ErrorHandler from '../config/errorHandler'
import { createCourse } from '../services/course.service'
import courseModel from '../models/course.model'
import { redis } from '../config/redis'
import mongoose from 'mongoose'
import ejs from 'ejs';
import path from "path";
import sendMail from '../config/sendMail'

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

export const getSingleCourse = AsyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const courseId = req.params.id;
        const isCacheExist = await redis.get(courseId);

        if (isCacheExist) {
            const course = JSON.parse(isCacheExist)
            res.status(201).json({
                success: true,
                course
            })
        } else {


            const course = await courseModel.findById(req.params.id).select('-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links')
            await redis.set(courseId, JSON.stringify(course))
            res.status(201).json({
                success: true,
                course
            })
        }

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }

})

// get all courses - without purchase
export const getAllCourse = AsyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const isCached = await redis.get("allCourses")
        if (isCached) {
            const courses = JSON.parse(isCached)
            res.status(201).json({
                success: true,
                courses
            })

        }
        else {

            const courses = await courseModel.find().select('-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links')
            await redis.set("allCourses", JSON.stringify(courses))
            res.status(201).json({
                success: true,
                courses
            })
        }

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }

})


//get course content --valid user

export const getCourseByUser = AsyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userCourseList = req.user?.courses;
        const courseId = req.params.id;
        // console.log(req.user)
        //check course exist in userModel db
        const courseExist = userCourseList?.find((course:any)=>course._id === courseId)

        if(!courseExist){
            return next(new ErrorHandler("You are not eligible to access this course",400));
        }

        const course = await courseModel.findById(courseId);

        const content = course?.courseData

        res.status(201).json({
            success:true,
            content
        })
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 400))

    }
})


//add question on course
interface IAddQuestionData{
    question:string,
    courseId:string,
    contentId:string
}

export const addQuestion = AsyncErrorHandler(async(req:Request,res:Response,next:NextFunction)=>{
    try {

        const {question,courseId,contentId} = req.body;
        const course = await courseModel.findById(courseId);

        if(!mongoose.Types.ObjectId.isValid(contentId)){
            return next(new ErrorHandler('Invalid content id',400));
        }

        const courseContent = course?.courseData?.find((item:any)=>item._id.equals(contentId));

        if(!courseContent){
            return next(new ErrorHandler("Invalid content id",400))
        }

        //create new question object
        const newQuestion:any={
            user:req.user,
            question,
            questionReplies:[]
        }

        // add new obj inside course content
        courseContent.questions.push(newQuestion);

        await course?.save();

        res.status(200).json({
            success:true,
            course
        })
        
    } catch (error:any) {
        return next(new ErrorHandler(error.message,400));
    }
})


// add answering course question

interface IAnswerData{
    answer:string,
    courseId:string,
    contentId:string,
    questionId:string
}

export const addAnswer = AsyncErrorHandler(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const {answer,courseId,contentId,questionId}= req.body;
        
        const course = await courseModel.findById(courseId);

        if(!mongoose.Types.ObjectId.isValid(contentId)){
            return next(new ErrorHandler('Invalid content id',400));
        }

        //find course content(perticular video)
        const courseContent = course?.courseData.find((item:any)=>item._id.equals(contentId))

        if(!courseContent){
            return next(new ErrorHandler('Invalid content id',400))
        }

        const question = courseContent?.questions.find((item:any)=>item._id.equals(questionId))

    if(!question){
        return next(new ErrorHandler('Invalid question id',400));
    }

    //create answer object
    const newAnswer:any={
        user:req.user,
        answer
    }

    question.questionReplies?.push(newAnswer);
    await course?.save()
    // console.log(course)

    //admin get notification
    if(req.user?._id === question.user._id ){
        //create notify
    } else{
        const data = {
            name:question.user.name,
            title:courseContent.title
        }

        const html = await ejs.renderFile(path.join(__dirname,"../mails/question-reply.ejs"),data);

        try {
            await sendMail({
                email:question.user.email,
                subject:"Question Reply",
                template:"question-reply.ejs",
                data
            })

            res.status(200).json({
                success:true,
                course
            })
        } catch (error:any) {
            return next(new ErrorHandler(error.message,400))

        }
    }
    

    } catch (error:any) {
        return next(new ErrorHandler(error.message,400))
    }
})