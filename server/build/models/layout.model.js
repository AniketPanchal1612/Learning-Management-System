"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const faqSchema = new mongoose_1.default.Schema({
    question: { type: String },
    answer: { type: String }
});
const categorySchema = new mongoose_1.default.Schema({
    title: { type: String }
});
const bannerImageSchema = new mongoose_1.default.Schema({
    publid_id: { type: String },
    url: { type: String }
});
const layoutSchema = new mongoose_1.default.Schema({
    type: { type: String },
    faq: [faqSchema],
    categories: [categorySchema],
    banner: {
        image: bannerImageSchema,
        title: { type: String },
        subTitle: { type: String }
    }
});
const layoutModel = mongoose_1.default.model('Layout', layoutSchema);
exports.default = layoutModel;
