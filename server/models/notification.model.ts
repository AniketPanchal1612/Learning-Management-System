import mongoose, { Model, Schema } from 'mongoose'

export interface INotification extends Document{
    title:string,
    message:string,
    status:string,
    userId:string
}


const notificationSchema: Schema<INotification> = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    message:{
        type:String,
        required:true
    },
    status:{
        type:String,
        required:true,
        default:'unread'
    } 

},{timestamps:true})


const notificationModel :Model<INotification> = mongoose.model("Notification",notificationSchema)
export default notificationModel
