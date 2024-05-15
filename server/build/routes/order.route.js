"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const order_controller_1 = require("../controllers/order.controller");
const user_controller_1 = require("../controllers/user.controller");
const orderRoute = express_1.default.Router();
orderRoute.post('/create-order', auth_1.isAuthenticated, order_controller_1.createOrder);
orderRoute.get('/get-orders', user_controller_1.updateAccessToken, auth_1.isAuthenticated, (0, auth_1.authorizeRoles)('admin'), order_controller_1.getAllOrders);
orderRoute.get("/payment/stripepublishablekey", order_controller_1.sendStripePublishableKey);
orderRoute.post("/payment", auth_1.isAuthenticated, order_controller_1.newPayment);
exports.default = orderRoute;
