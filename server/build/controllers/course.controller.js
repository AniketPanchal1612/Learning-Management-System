"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVideoUrl = exports.deleteCourse = exports.getAllCourses = exports.addReplyToReview = exports.addReview = exports.addAnswer = exports.addQuestion = exports.getCourseByUser = exports.getAllCourse = exports.getSingleCourse = exports.editCourse = exports.uploadCourse = void 0;
const cloudinary_1 = __importDefault(require("cloudinary"));
const asyncErrorHandler_1 = require("../middleware/asyncErrorHandler");
const errorHandler_1 = __importDefault(require("../config/errorHandler"));
const course_service_1 = require("../services/course.service");
const course_model_1 = __importDefault(require("../models/course.model"));
const redis_1 = require("../config/redis");
const mongoose_1 = __importDefault(require("mongoose"));
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const sendMail_1 = __importDefault(require("../config/sendMail"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
const axios_1 = __importDefault(require("axios"));
//upload course
exports.uploadCourse = (0, asyncErrorHandler_1.AsyncErrorHandler)(async (req, res, next) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        // if (thumbnail) {
        //     const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
        //         folder: 'lms_courses'
        //     })
        //     data.thumbnail = {
        //         public_id: myCloud.public_id,
        //         url: myCloud.secure_url
        //     }
        // }
        (0, course_service_1.createCourse)(data, res, next);
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
//edit course
// export const editCourse = AsyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const data = req.body;
//         // const thumbnail = req.body;
//         // if (thumbnail) {
//         //     await cloudinary.v2.uploader.destroy(thumbnail.public_id)
//         //     const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
//         //         folder: "lms_courses"
//         //     })
//         //     data.thumbnail = {
//         //         public_id: myCloud.public_id,
//         //         url: myCloud.secure_url
//         //     }
//         // }
//         const courseId = req.params.id;
//         const course = await courseModel.findByIdAndUpdate(courseId, { $set: data }, { new: true })
//         res.status(201).json({ success: true, course })
//     } catch (error: any) {
//         return next(new ErrorHandler(error.message, 400))
//     }
// })
// edit course
exports.editCourse = (0, asyncErrorHandler_1.AsyncErrorHandler)(async (req, res, next) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        const courseId = req.params.id;
        const courseData = await course_model_1.default.findById(courseId);
        if (thumbnail && !thumbnail.startsWith("https")) {
            await cloudinary_1.default.v2.uploader.destroy(courseData.thumbnail.public_id);
            const myCloud = await cloudinary_1.default.v2.uploader.upload(thumbnail, {
                folder: "courses",
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        if (thumbnail.startsWith("https")) {
            data.thumbnail = {
                public_id: courseData?.thumbnail.public_id,
                url: courseData?.thumbnail.url,
            };
        }
        const course = await course_model_1.default.findByIdAndUpdate(courseId, {
            $set: data,
        }, { new: true });
        await redis_1.redis.set(courseId, JSON.stringify(course)); // update course in redis
        res.status(201).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
});
//get single course - without purchase
exports.getSingleCourse = (0, asyncErrorHandler_1.AsyncErrorHandler)(async (req, res, next) => {
    try {
        const courseId = req.params.id;
        const isCacheExist = await redis_1.redis.get(courseId);
        if (isCacheExist) {
            const course = JSON.parse(isCacheExist);
            res.status(201).json({
                success: true,
                course
            });
        }
        else {
            const course = await course_model_1.default.findById(req.params.id).select('-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links');
            await redis_1.redis.set(courseId, JSON.stringify(course), 'EX', 604800);
            res.status(201).json({
                success: true,
                course
            });
        }
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// get all courses - without purchase
exports.getAllCourse = (0, asyncErrorHandler_1.AsyncErrorHandler)(async (req, res, next) => {
    try {
        // const isCached = await redis.get("allCourses")
        // if (isCached) {
        //     console.log("From Cache")
        //     const courses = JSON.parse(isCached)
        //     res.status(201).json({
        //         success: true,
        //         courses
        //     })
        // }
        // else {
        const courses = await course_model_1.default.find().select('-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links');
        // await redis.set("allCourses", JSON.stringify(courses))
        res.status(201).json({
            success: true,
            courses
        });
        // }
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
//get course content --valid user
exports.getCourseByUser = (0, asyncErrorHandler_1.AsyncErrorHandler)(async (req, res, next) => {
    try {
        const userCourseList = req.user?.courses;
        const courseId = req.params.id;
        // console.log(req.user)
        //check course exist in userModel db
        const courseExist = userCourseList?.find((course) => course._id === courseId);
        if (!courseExist) {
            return next(new errorHandler_1.default("You are not eligible to access this course", 400));
        }
        const course = await course_model_1.default.findById(courseId);
        const content = course?.courseData;
        res.status(201).json({
            success: true,
            content
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
exports.addQuestion = (0, asyncErrorHandler_1.AsyncErrorHandler)(async (req, res, next) => {
    try {
        const { question, courseId, contentId } = req.body;
        const course = await course_model_1.default.findById(courseId);
        if (!mongoose_1.default.Types.ObjectId.isValid(contentId)) {
            return next(new errorHandler_1.default("Invalid content id", 400));
        }
        const couseContent = course?.courseData?.find((item) => item._id.equals(contentId));
        if (!couseContent) {
            return next(new errorHandler_1.default("Invalid content id", 400));
        }
        // create a new question object
        const newQuestion = {
            user: req.user,
            question,
            questionReplies: [],
        };
        // add this question to our course content
        couseContent.questions.push(newQuestion);
        await notification_model_1.default.create({
            user: req.user?._id,
            title: "New Question Received",
            message: `You have a new question in ${couseContent.title}`,
        });
        // save the updated course
        await course?.save();
        res.status(200).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
});
exports.addAnswer = (0, asyncErrorHandler_1.AsyncErrorHandler)(async (req, res, next) => {
    try {
        const { answer, courseId, contentId, questionId } = req.body;
        const course = await course_model_1.default.findById(courseId);
        if (!mongoose_1.default.Types.ObjectId.isValid(contentId)) {
            return next(new errorHandler_1.default('Invalid content id', 400));
        }
        //find course content(perticular video)
        const courseContent = course?.courseData.find((item) => item._id.equals(contentId));
        console.log(courseContent);
        if (!courseContent) {
            return next(new errorHandler_1.default('Invalid content id', 400));
        }
        const question = courseContent?.questions.find((item) => item._id.equals(questionId));
        if (!question) {
            return next(new errorHandler_1.default('Invalid question id', 400));
        }
        //create answer object
        const newAnswer = {
            user: req.user,
            answer,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        question.questionReplies?.push(newAnswer);
        console.log(question);
        await course?.save();
        // console.log(course)
        //admin get notification
        if (req.user?._id === question.user._id) {
            //create notify
            await notification_model_1.default.create({
                user: req.user?._id,
                title: "New Question Reply Received",
                message: `You have a new question reply in ${courseContent.title}`
            });
        }
        else {
            const data = {
                name: question.user.name,
                title: courseContent.title
            };
            const html = await ejs_1.default.renderFile(path_1.default.join(__dirname, "../mails/question-reply.ejs"), data);
            try {
                await (0, sendMail_1.default)({
                    email: question.user.email,
                    subject: "Question Reply",
                    template: "question-reply.ejs",
                    data
                });
                res.status(200).json({
                    success: true,
                    course
                });
            }
            catch (error) {
                return next(new errorHandler_1.default(error.message, 400));
            }
        }
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
exports.addReview = (0, asyncErrorHandler_1.AsyncErrorHandler)(async (req, res, next) => {
    try {
        const userCourseList = req.user?.courses;
        const courseId = req.params.id;
        // check if courseId already exists in userCourseList based on _id
        const courseExists = userCourseList?.some((course) => course._id.toString() === courseId.toString());
        if (!courseExists) {
            return next(new errorHandler_1.default("You are not eligible to access this course", 404));
        }
        const course = await course_model_1.default.findById(courseId);
        const { review, rating } = req.body;
        const reviewData = {
            user: req.user,
            rating,
            comment: review,
        };
        course?.reviews.push(reviewData);
        let avg = 0;
        course?.reviews.forEach((rev) => {
            avg += rev.rating;
        });
        if (course) {
            course.ratings = avg / course.reviews.length; // one example we have 2 reviews one is 5 another one is 4 so math working like this = 9 / 2  = 4.5 ratings
        }
        await course?.save();
        await redis_1.redis.set(courseId, JSON.stringify(course), "EX", 604800); // 7days
        // create notification
        await notification_model_1.default.create({
            user: req.user?._id,
            title: "New Review Received",
            message: `${req.user?.name} has given a review in ${course?.name}`,
        });
        res.status(200).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
});
exports.addReplyToReview = (0, asyncErrorHandler_1.AsyncErrorHandler)(async (req, res, next) => {
    try {
        const { comment, courseId, reviewId } = req.body;
        const course = await course_model_1.default.findById(courseId);
        // console.log(course)
        if (!course) {
            return next(new errorHandler_1.default('Course is not found', 400));
        }
        const review = course?.reviews?.find((rev) => rev._id.toString() === reviewId);
        // console.log(reviewId)
        // console.log(course.reviews[0]._id)
        if (!review) {
            return next(new errorHandler_1.default('Review not found', 400));
        }
        const replyData = {
            user: req.user,
            comment,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        if (!review.commentReplies) {
            review.commentReplies = [];
        }
        review.commentReplies?.push(replyData);
        await course?.save();
        await redis_1.redis.set(courseId, JSON.stringify(course), "EX", 604800); // 7days
        res.status(200).json({
            success: true,
            course
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
exports.getAllCourses = (0, asyncErrorHandler_1.AsyncErrorHandler)(async (req, res, next) => {
    try {
        (0, course_service_1.getAllCoursesService)(res);
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// delete course - admin
exports.deleteCourse = (0, asyncErrorHandler_1.AsyncErrorHandler)(async (req, res, next) => {
    try {
        const { id } = req.params;
        const course = await course_model_1.default.findById(id);
        if (!course) {
            return next(new errorHandler_1.default('Course does not found', 400));
        }
        await course.deleteOne({ id });
        await redis_1.redis.del(id);
        res.status(201).json({
            success: true,
            message: "Course deleted successfully"
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// generate video url
exports.generateVideoUrl = (0, asyncErrorHandler_1.AsyncErrorHandler)(async (req, res, next) => {
    try {
        const { videoId } = req.body;
        const response = await axios_1.default.post(`https://dev.vdocipher.com/api/videos/${videoId}/otp`, { ttl: 300 }, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Apisecret ${process.env.VDOCIPHER_API_SECRET}`,
            },
        });
        res.json(response.data);
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
