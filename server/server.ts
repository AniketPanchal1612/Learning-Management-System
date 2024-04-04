import {app} from './app'
import connectDB from './config/db';
const dotenv = require('dotenv')
dotenv.config();



app.listen(process.env.PORT,()=>{
    console.log(`Server is started ${process.env.PORT}`)
    connectDB();
})
