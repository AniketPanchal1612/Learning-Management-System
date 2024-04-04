import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors';
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'



export const app = express();


app.use(express.json({limit:"50mb"})) //body parser

app.use(cookieParser()) //cookie parser

app.use(cors({
    origin: process.env.ORIGIN
}))



// testing App

app.get("/test",(req:Request,res:Response,next:NextFunction)=>{
    res.status(200).json({
        success:true,
        message:"API is working"
    })
})


//unknown path
app.all("*",(req:Request,res:Response,next:NextFunction)=>{
    const err = new Error(`Route ${req.originalUrl} is not found`) as any;
    err.statusCode = 404;
    next(err) 

})

