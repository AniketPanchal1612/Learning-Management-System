import path from "path"
import ejs from 'ejs'
import { AsyncErrorHandler } from "../middleware/asyncErrorHandler"
import { NextFunction, Request, Response } from "express"
import ErrorHandler from "../config/errorHandler"
import { IOrder } from "../models/order.model"
import userModel from "../models/user.model"
import courseModel, { ICourse } from "../models/course.model"
import { getAllOrderService, newOrder } from "../services/order.service"
import sendMail from "../config/sendMail"
import notificationModel from "../models/notification.model"
import { redis } from "../config/redis"

require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)


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


export const createOrder = AsyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId, payment_info } = req.body as IOrder;

      if (payment_info) {
        if ("id" in payment_info) {
          const paymentIntentId = payment_info.id;
          const paymentIntent = await stripe.paymentIntents.retrieve(
            paymentIntentId
          );

          if (paymentIntent.status !== "succeeded") {
            return next(new ErrorHandler("Payment not authorized!", 400));
          }
        }
      }

      const user = await userModel.findById(req.user?._id);

      const courseExistInUser = user?.courses.some(
        (course: any) => course._id.toString() === courseId
      );

      // if (courseExistInUser) {
      //   return next(
      //     new ErrorHandler("You have already purchased this course", 400)
      //   );
      // }

      const course: ICourse | null = await courseModel.findById(courseId);

      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }

      const data: any = {
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

      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/order-confirmation.ejs"),
        { order: mailData }
      );

      try {
        if (user) {
          await sendMail({
            email: user.email,
            subject: "Order Confirmation",
            template: "order-confirmation.ejs",
            data: mailData,
          });
        }
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }

      user?.courses.push(course?._id);

      await redis.set(req.user?._id, JSON.stringify(user));

      await user?.save();

      await notificationModel.create({
        user: user?._id,
        title: "New Order",
        message: `You have a new order from ${course?.name}`,
      });

      course.purchased = course.purchased + 1;

      await course.save();

      newOrder(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);



//get all orders -admin

export const getAllOrders = AsyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        getAllOrderService(res);

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));

    }
})



export const sendStripePublishableKey = AsyncErrorHandler(
    async (req: Request, res: Response) => {
        res.status(200).json({
            publishablekey: process.env.STRIPE_PUBLISHABLE_KEY,
        });
    }
);



// new payment
export const newPayment = AsyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
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
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }
    }
  );