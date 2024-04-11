import { NextFunction, Request, Response } from "express";
import { AsyncErrorHandler } from "../middleware/asyncErrorHandler";
import ErrorHandler from "../config/errorHandler";
import notificationModel from "../models/notification.model";



// get all notifications - admin
export const getNotifications = AsyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notifications = await notificationModel.find().sort({ createdAt: -1 });

        res.status(201).json({
            success: true,
            notifications
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})



//update notification status
export const updateNotification = AsyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const notification = await notificationModel.findById(req.params.id);
        if (!notification) {
            return next(new ErrorHandler('Notification not found', 400))
        } else {
            notification.status ? notification.status = 'read' : notification?.status
        }

        await notification?.save()

        const notifications = await notificationModel.find().sort({createdAt:-1})
        res.status(201).json({
            success: true,
            notifications
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})