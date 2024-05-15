import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors';
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { ErrorMiddleware } from './middleware/error';
import userRouter from './routes/user.route';
import courseRouter from './routes/course.route';
import orderRoute from './routes/order.route';
import notificationRoute from './routes/notification.route';
import analyticsRoute from './routes/analytics.route';
import layoutRouter from './routes/layout.routes';
// const userRoute = require('./routes/user.route')


export const app = express();


app.use(express.json({limit:"50mb"})) //body parser

app.use(cookieParser()) //cookie parser

app.use(cors({
    origin: ['https://lms-frontend-delta-ivory.vercel.app'],
    credentials:true
}))




// routes

app.use('/api/v1', userRouter)
app.use('/api/v1',courseRouter)
app.use('/api/v1',orderRoute)
app.use('/api/v1',notificationRoute)
app.use('/api/v1',analyticsRoute)
app.use('/api/v1',layoutRouter)


// testing App

app.get("/test",(req:Request,res:Response,next:NextFunction)=>{
    res.status(200).json({
        success:true,
        message:"API is working",
        // hello: req.cookies
    })
})


//unknown path
app.all("*",(req:Request,res:Response,next:NextFunction)=>{
    const err = new Error(`Route ${req.originalUrl} is not found`) as any;
    err.statusCode = 404;
    next(err) 

})


app.use(ErrorMiddleware)

