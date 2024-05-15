"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newPayment = exports.sendStripePublishableKey = exports.getAllOrders = exports.createOrder = void 0;
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
const asyncErrorHandler_1 = require("../middleware/asyncErrorHandler");
const errorHandler_1 = __importDefault(require("../config/errorHandler"));
const user_model_1 = __importDefault(require("../models/user.model"));
const course_model_1 = __importDefault(require("../models/course.model"));
const order_service_1 = require("../services/order.service");
const sendMail_1 = __importDefault(require("../config/sendMail"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
const redis_1 = require("../config/redis");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// export const createOrder = AsyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { courseId, payment_info } = req.body as IOrder;
//         if (payment_info) {
//           if ("id" in payment_info) {
//             const paymentIntentId = payment_info.id;
//             const paymentIntent = await stripe.paymentIntents.retrieve(
//               paymentIntentId
//             );
//             if (paymentIntent.status !== "succeeded") {
//               return next(new ErrorHandler("Payment not authorized!", 400));
//             }
//           }
//         }
//         const user = await userModel.findById(req.user?._id);
//         const courseExistInUser = user?.courses.find((course: any) => course._id.toString() === courseId)
//         // if(courseExistInUser){
//         //     return next(new ErrorHandler('You have already purchased this course',400));
//         // }
//         const course: ICourse | null = await courseModel.findById(courseId);
//         if (!course) {
//             return next(new ErrorHandler("Course not found", 400));
//         }
//         const data: any = {
//             courseId: course._id,
//             userId: user?._id,
//             payment_info
//         }
//         const mailData = {
//             order: {
//                 _id: course._id.toString().slice(0, 6),
//                 name: course.name,
//                 price: course.price,
//                 date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
//             }
//         }
//         const html = await ejs.renderFile(path.join(__dirname, "../mails/order-confirmation.ejs"), { order: mailData })
//         try {
//             if (user) {
//                 await sendMail({
//                     email: user.email,
//                     subject: "Order Confirmation",
//                     template: "order-confirmation.ejs",
//                     data: mailData
//                 })
//             }
//         } catch (error: any) {
//             return next(new ErrorHandler(error.message, 400))
//         }
//         user?.courses.push(course?._id);
//         await redis.set(req.user?._id,JSON.stringify(user));
//         await user?.save()
//         const notification = await notificationModel.create({
//             user: user?._id,
//             title: "New Order",
//             message: `You have new order from ${course?.name}`
//         })
//         course.purchased = course.purchased + 1;
//         console.log(course)
//         // console.log(course.purchased)
//         await course.save
//         newOrder(data, res, next);
//     } catch (error: any) {
//         return next(new ErrorHandler(error.message, 400))
//     }
// })
exports.createOrder = (0, asyncErrorHandler_1.AsyncErrorHandler)(async (req, res, next) => {
    try {
        const { courseId, payment_info } = req.body;
        if (payment_info) {
            if ("id" in payment_info) {
                const paymentIntentId = payment_info.id;
                const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
                if (paymentIntent.status !== "succeeded") {
                    return next(new errorHandler_1.default("Payment not authorized!", 400));
                }
            }
        }
        const user = await user_model_1.default.findById(req.user?._id);
        const courseExistInUser = user?.courses.some((course) => course._id.toString() === courseId);
        // if (courseExistInUser) {
        //   return next(
        //     new ErrorHandler("You have already purchased this course", 400)
        //   );
        // }
        const course = await course_model_1.default.findById(courseId);
        if (!course) {
            return next(new errorHandler_1.default("Course not found", 404));
        }
        const data = {
            courseId: course._id,
            userId: user?._id,
            payment_info,
        };
        const mailData = {
            order: {
                _id: course._id.toString().slice(0, 6),
                name: course.name,
                price: course.price,
                date: new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                }),
            },
        };
        const html = await ejs_1.default.renderFile(path_1.default.join(__dirname, "../mails/order-confirmation.ejs"), { order: mailData });
        try {
            if (user) {
                await (0, sendMail_1.default)({
                    email: user.email,
                    subject: "Order Confirmation",
                    template: "order-confirmation.ejs",
                    data: mailData,
                });
            }
        }
        catch (error) {
            return next(new errorHandler_1.default(error.message, 500));
        }
        user?.courses.push(course?._id);
        await redis_1.redis.set(req.user?._id, JSON.stringify(user));
        await user?.save();
        await notification_model_1.default.create({
            user: user?._id,
            title: "New Order",
            message: `You have a new order from ${course?.name}`,
        });
        course.purchased = course.purchased + 1;
        await course.save();
        (0, order_service_1.newOrder)(data, res, next);
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
});
//get all orders -admin
exports.getAllOrders = (0, asyncErrorHandler_1.AsyncErrorHandler)(async (req, res, next) => {
    try {
        (0, order_service_1.getAllOrderService)(res);
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
exports.sendStripePublishableKey = (0, asyncErrorHandler_1.AsyncErrorHandler)(async (req, res) => {
    res.status(200).json({
        publishablekey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
});
// new payment
exports.newPayment = (0, asyncErrorHandler_1.AsyncErrorHandler)(async (req, res, next) => {
    try {
        const myPayment = await stripe.paymentIntents.create({
            amount: req.body.amount,
            currency: "USD",
            description: "E-learning course services",
            metadata: {
                company: "E-Learning",
            },
            automatic_payment_methods: {
                enabled: true,
            },
            shipping: {
                name: "Aniket Panchal",
                address: {
                    line1: "510 Townsend St",
                    postal_code: "98140",
                    city: "San Francisco",
                    state: "CA",
                    country: "US",
                },
            },
        });
        res.status(201).json({
            success: true,
            client_secret: myPayment.client_secret,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
});
