import { NextFunction, Request, Response } from "express";
import { AsyncErrorHandler } from "../middleware/asyncErrorHandler";
import ErrorHandler from "../config/errorHandler";
import cloudinary from 'cloudinary'
import layoutModel from "../models/layout.model";

export const createLayout = AsyncErrorHandler(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const {type} = req.body;
        const isTypeExist = await layoutModel.findOne({type})
        if(isTypeExist){
            return next(new ErrorHandler(`${type} already exists`,400));
        }
        if(type==='Banner'){
            const {image,title,subTitle} = req.body;
            const myCloud = await cloudinary.v2.uploader.upload(image,{
                folder:'lms_layout'
            }) 

            const banner={
                image:{
                    public_id:myCloud.public_id,
                    url:myCloud.secure_url
                },
                title,
                subTitle
            }
            await layoutModel.create()
        }

        if(type==='FAQ'){
            const {faq} = req.body;
            const faqItems = await Promise.all(
                faq.map(async(item:any)=>{
                    return{
                        question:item.question,
                        answer:item.answer
                    }
                })
            )
            await layoutModel.create({type:"FAQ",faq:faqItems})
        }

        if(type==='Categories'){
            const {categories} = req.body;
            const categoryItems = await Promise.all(
                categories.map(async(item:any)=>{
                    return {
                        title:item.title
                    }
                })
            )
            await layoutModel.create({type:"Categories",categories:categoryItems})
        }

        res.status(201).json({
            success:true,
            message:'Layout created successfully'
        })

    } catch (error:any) {
        return next(new ErrorHandler(error.message,400))
    }
})