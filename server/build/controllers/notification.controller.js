"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNotification = exports.getNotifications = void 0;
const asyncErrorHandler_1 = require("../middleware/asyncErrorHandler");
const errorHandler_1 = __importDefault(require("../config/errorHandler"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
const node_cron_1 = __importDefault(require("node-cron"));
// get all notifications - admin
exports.getNotifications = (0, asyncErrorHandler_1.AsyncErrorHandler)(async (req, res, next) => {
    try {
        const notifications = await notification_model_1.default.find().sort({ createdAt: -1 });
        res.status(201).json({
            success: true,
            notifications
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
//update notification status
exports.updateNotification = (0, asyncErrorHandler_1.AsyncErrorHandler)(async (req, res, next) => {
    try {
        const notification = await notification_model_1.default.findById(req.params.id);
        if (!notification) {
            return next(new errorHandler_1.default('Notification not found', 400));
        }
        else {
            notification.status ? notification.status = 'read' : notification?.status;
        }
        await notification?.save();
        const notifications = await notification_model_1.default.find().sort({ createdAt: -1 });
        res.status(201).json({
            success: true,
            notifications
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// delete notifications using cron
//every mid-night call
node_cron_1.default.schedule("0 0 0 * * *", async () => {
    const thirtyDayAge = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await notification_model_1.default.deleteMany({ status: 'read', createdAt: { $lt: thirtyDayAge } });
    console.log('Delete read notification');
});
