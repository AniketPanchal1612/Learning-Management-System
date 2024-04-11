import { Response } from "express";
import { AsyncErrorHandler } from "../middleware/asyncErrorHandler";
import courseModel from "../models/course.model";



//create course
export const createCourse = AsyncErrorHandler(async(data:any,res:Response)=>{
    const course = await courseModel.create(data);
    res.status(201).json({
        success:true,
        course
    })
})


//get all courses
export const getAllCoursesService = async(res:Response)=>{
    const courses = await courseModel.find().sort({createdAt:-1})

    res.status(201).json({
        success:true,
        courses
    })
}