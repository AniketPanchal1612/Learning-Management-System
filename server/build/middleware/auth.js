"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.isAuthenticated = void 0;
const asyncErrorHandler_1 = require("./asyncErrorHandler");
const errorHandler_1 = __importDefault(require("../config/errorHandler"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const redis_1 = require("../config/redis");
dotenv_1.default.config();
exports.isAuthenticated = (0, asyncErrorHandler_1.AsyncErrorHandler)(async (req, res, next) => {
    const access_token = req.cookies.access_token;
    console.log(access_token);
    if (!access_token) {
        return next(new errorHandler_1.default("Please login to access this resource", 400));
    }
    const decoded = await jsonwebtoken_1.default.verify(access_token, process.env.ACCESS_TOKEN);
    if (!decoded) {
        return next(new errorHandler_1.default("access token is invalid", 400));
    }
    // console.log(decoded)
    const user = await redis_1.redis.get(decoded.id);
    if (!user) {
        return next(new errorHandler_1.default("User not found! Please login to access this resources", 400));
    }
    req.user = JSON.parse(user);
    next();
});
// validate user role
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user?.role || '')) {
            return next(new errorHandler_1.default(`Role ${req.user?.role} is not allowed to acces this resource`, 403));
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
