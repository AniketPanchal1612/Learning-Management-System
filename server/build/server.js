"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const cloudinary_1 = require("cloudinary");
const http_1 = __importDefault(require("http"));
const db_1 = __importDefault(require("./config/db"));
const socketServer_1 = require("./socketServer");
const dotenv = require('dotenv');
dotenv.config();
const server = http_1.default.createServer(app_1.app);
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
(0, socketServer_1.initSocketServer)(server);
app_1.app.listen(process.env.PORT, () => {
    console.log(`Server is started ${process.env.PORT}`);
    (0, db_1.default)();
});
