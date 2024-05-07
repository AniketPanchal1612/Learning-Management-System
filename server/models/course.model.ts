import mongoose, { Document, Model, Schema } from "mongoose";
import { IUser } from "./user.model";

interface IComment extends Document {
    user: IUser,
    question: string,
    questionReplies?: IComment[]
}

interface IReview extends Document {
    user: IUser,
    rating: number,
    comment: string,
    commentReplies : IReview[];

}

interface ILink extends Document {
    title: string,
    url: string
}

interface ICourseData extends Document {
    title: string,
    description: string,
    videoUrl: string,
    videoThumbnail: object,
    videoSection: string,
    videoLength: number,
    videoPlayer: string,
    links: ILink[],
    suggestion: string,
    questions: IComment[]
}

interface ICourse extends Document {
    name: string,
    description: string,
    categories:string,
    price: number,
    estimatedPrice?: number,
    thumbnail: object,
    tags: string,
    level: string,
    demoUrl: string,
    benefits: { title: string }[];
    prerequisites: { title: string }[];
    reviews: IReview[],
    courseData: ICourseData[],
    ratings?: number,
    purchased: number
}


const reviewSchema: Schema<IReview> = new mongoose.Schema({
    user: Object,
    rating: {
        type: Number,
        default: 0
    },
    comment: String,
    commentReplies :[Object]
})

const linkSchema: Schema<ILink> = new mongoose.Schema({
    title: String,
    url: String
})

const commentSchema: Schema<IComment> = new mongoose.Schema({
    user: Object,
    question: String,
    questionReplies: [Object]
})

const courseDataSchema: Schema<ICourseData> = new mongoose.Schema({
    title: String,
    description: String,
    videoUrl: String,
    // videoThumbnail: Object,
    videoSection: String,
    videoLength: Number,
    videoPlayer: String,
    links: [linkSchema],
    suggestion: String,
    questions: [commentSchema]
})



const courseSchema: Schema<ICourse> = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    categories:{
        type:String,
        required:true
    },
    price: {
        type: Number,
        required: true
    },
    estimatedPrice: {
        type: Number
    },
    thumbnail: {
        public_id: {
            type: String,
            // required: true
        },
        url: {
            type: String,
            // required: true
        }
    },
    tags: {
        type: String,
        required: true
    },
    level: {
        type: String,
        required: true
    },
    demoUrl: {
        type: String,
        required: true
    },
    benefits:[{title:String}],
    prerequisites:[{title:String}],
    reviews:[reviewSchema],
    courseData:[courseDataSchema],
    ratings:{
        type:Number,
        default:0
    },
    purchased:{
        type:Number,
        default:0
    }
},{timestamps:true})

const courseModel:Model<ICourse> = mongoose.model("Course",courseSchema)
export default courseModel
