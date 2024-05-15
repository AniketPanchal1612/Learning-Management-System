"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncErrorHandler = void 0;
const AsyncErrorHandler = (theFunc) => (req, res, next) => {
    Promise.resolve(theFunc(req, res, next)).catch(next);
};
exports.AsyncErrorHandler = AsyncErrorHandler;
