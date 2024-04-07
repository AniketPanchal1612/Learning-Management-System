import {app} from './app'
import { v2 as cloudinary } from "cloudinary";

import connectDB from './config/db';
const dotenv = require('dotenv')
dotenv.config();

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})



app.listen(process.env.PORT,()=>{
    console.log(`Server is started ${process.env.PORT}`)
    connectDB();
})
