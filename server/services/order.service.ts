import { Response } from "express";
import { AsyncErrorHandler } from "../middleware/asyncErrorHandler";
import orderModel from "../models/order.model";


export const newOrder = AsyncErrorHandler(async(data:any,res:Response)=>{
        
        const order =await orderModel.create(data);
        
        res.status(201).json({
            success:true,
            order
        })
})


//get all orders
export const getAllOrderService = async(res:Response)=>{
    const orders = await orderModel.find().sort({createdAt:-1})

    res.status(201).json({
        success:true,
        orders
    })
}