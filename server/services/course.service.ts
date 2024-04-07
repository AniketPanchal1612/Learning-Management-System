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
