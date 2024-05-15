"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLayoutByType = exports.editLayout = exports.createLayout = void 0;
const asyncErrorHandler_1 = require("../middleware/asyncErrorHandler");
const errorHandler_1 = __importDefault(require("../config/errorHandler"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const layout_model_1 = __importDefault(require("../models/layout.model"));
exports.createLayout = (0, asyncErrorHandler_1.AsyncErrorHandler)(async (req, res, next) => {
    try {
        const { type } = req.body;
        const isTypeExist = await layout_model_1.default.findOne({ type });
        if (isTypeExist) {
            return next(new errorHandler_1.default(`${type} already exists`, 400));
        }
        if (type === 'Banner') {
            const { image, title, subTitle } = req.body;
            const myCloud = await cloudinary_1.default.v2.uploader.upload(image, {
                folder: 'lms_layout'
            });
            const banner = {
                type: "Banner",
                banner: {
                    image: {
                        public_id: myCloud.public_id,
                        url: myCloud.secure_url
                    },
                },
                title,
                subTitle
            };
            await layout_model_1.default.create(banner);
        }
        if (type === 'FAQ') {
            const { faq } = req.body;
            const faqItems = await Promise.all(faq.map(async (item) => {
                return {
                    question: item.question,
                    answer: item.answer
                };
            }));
            await layout_model_1.default.create({ type: "FAQ", faq: faqItems });
        }
        if (type === 'Categories') {
            const { categories } = req.body;
            const categoryItems = await Promise.all(categories.map(async (item) => {
                return {
                    title: item.title
                };
            }));
            await layout_model_1.default.create({ type: "Categories", categories: categoryItems });
        }
        res.status(201).json({
            success: true,
            message: 'Layout created successfully'
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// edit layout
// export const editLayout = AsyncErrorHandler(async(req:Request,res:Response,next:NextFunction)=>{
//     try {
//         const {type} = req.body;
//         if(type==='Banner'){
//             const {image,title,subTitle} = req.body;
//             const bannerData:any = await layoutModel.findOne({type:"Banner"})
//             await cloudinary.v2.uploader.destroy(bannerData.image.public_id)
//             const myCloud = await cloudinary.v2.uploader.upload(image,{
//                 folder:'lms_layout'
//             }) 
//             const banner={
//                 image:{
//                     public_id:myCloud.public_id,
//                     url:myCloud.secure_url
//                 },
//                 title,
//                 subTitle
//             }
//             await layoutModel.findByIdAndUpdate(bannerData._id,{banner})
//         }
//         if(type==='FAQ'){
//             const {faq} = req.body;
//             const faqItem  = await layoutModel.findOne({type:"FAQ"})
//             const faqItems = await Promise.all(
//                 faq.map(async(item:any)=>{
//                     return{
//                         question:item.question,
//                         answer:item.answer
//                     }
//                 })
//             )
//             await layoutModel.findByIdAndUpdate(faqItem?._id,{type:"FAQ",faq:faqItems})
//         }
//         if(type==='Categories'){
//             const {categories} = req.body;
//             const categoriesData = await layoutModel.findOne({type:"Categories"})
//             const categoryItems = await Promise.all(
//                 categories.map(async(item:any)=>{
//                     return {
//                         title:item.title
//                     }
//                 })
//             )
//             await layoutModel.findByIdAndUpdate(categoriesData?._id,{type:"Categories",categories:categoryItems})
//         }
//         res.status(201).json({
//             success:true,
//             message:'Layout Updated successfully'
//         })
//     } catch (error:any) {
//         return next(new ErrorHandler(error.message,400))
//     }
// })
exports.editLayout = (0, asyncErrorHandler_1.AsyncErrorHandler)(async (req, res, next) => {
    try {
        const { type } = req.body;
        if (type === "Banner") {
            const bannerData = await layout_model_1.default.findOne({ type: "Banner" });
            const { image, title, subTitle } = req.body;
            //   const data = image.startsWith("https")
            //     ? bannerData
            //     : await cloudinary.v2.uploader.upload(image, {
            //         folder: "layout",
            //       });
            const banner = {
                type: "Banner",
                // image: {
                //   public_id: image.startsWith("https")
                //     ? bannerData.banner.image.public_id
                //     : data?.public_id,
                //   url: image.startsWith("https")
                //     ? bannerData.banner.image.url
                //     : data?.secure_url,
                // },
                title,
                subTitle,
            };
            await layout_model_1.default.findByIdAndUpdate(bannerData._id, { banner });
        }
        if (type === "FAQ") {
            const { faq } = req.body;
            const FaqItem = await layout_model_1.default.findOne({ type: "FAQ" });
            const faqItems = await Promise.all(faq.map(async (item) => {
                return {
                    question: item.question,
                    answer: item.answer,
                };
            }));
            await layout_model_1.default.findByIdAndUpdate(FaqItem?._id, {
                type: "FAQ",
                faq: faqItems,
            });
        }
        if (type === "Categories") {
            const { categories } = req.body;
            const categoriesData = await layout_model_1.default.findOne({
                type: "Categories",
            });
            const categoriesItems = await Promise.all(categories.map(async (item) => {
                return {
                    title: item.title,
                };
            }));
            await layout_model_1.default.findByIdAndUpdate(categoriesData?._id, {
                type: "Categories",
                categories: categoriesItems,
            });
        }
        res.status(200).json({
            success: true,
            message: "Layout Updated successfully",
        });
    }
    catch (error) {
        console.log(error);
        return next(new errorHandler_1.default(error.message, 500));
    }
});
//get layout by type
// get layout by type
exports.getLayoutByType = (0, asyncErrorHandler_1.AsyncErrorHandler)(async (req, res, next) => {
    try {
        const { type } = req.params;
        const layout = await layout_model_1.default.findOne({ type });
        res.status(201).json({
            success: true,
            layout,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
});
