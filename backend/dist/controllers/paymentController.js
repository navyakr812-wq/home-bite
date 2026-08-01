"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = exports.createRazorpayOrder = void 0;
const Order_1 = require("../models/Order");
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkey123';
const key_secret = process.env.RAZORPAY_KEY_SECRET || 'mocksecret123';
const razorpay = new razorpay_1.default({
    key_id,
    key_secret,
});
const createRazorpayOrder = async (req, res) => {
    try {
        const { amount, receipt } = req.body;
        if (!amount) {
            return res.status(400).json({ message: 'Amount is required' });
        }
        const options = {
            amount: Math.round(Number(amount) * 100), // convert to paise
            currency: 'INR',
            receipt: receipt || `receipt_${Date.now()}`,
        };
        const order = await razorpay.orders.create(options);
        res.status(201).json(order);
    }
    catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ message: 'Error creating payment order', error });
    }
};
exports.createRazorpayOrder = createRazorpayOrder;
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
            return res.status(400).json({ message: 'Missing required payment verification parameters' });
        }
        const generated_signature = crypto_1.default
            .createHmac('sha256', key_secret)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');
        const order = await Order_1.Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        if (generated_signature === razorpay_signature) {
            order.paymentStatus = 'Paid';
            order.status = 'Placed';
            order.razorpayOrderId = razorpay_order_id;
            order.razorpayPaymentId = razorpay_payment_id;
            order.razorpaySignature = razorpay_signature;
            await order.save();
            res.json({ success: true, message: 'Payment verified successfully', order });
        }
        else {
            order.paymentStatus = 'Failed';
            order.razorpayOrderId = razorpay_order_id;
            order.razorpayPaymentId = razorpay_payment_id;
            order.razorpaySignature = razorpay_signature;
            await order.save();
            res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    }
    catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: 'Payment verification failed', error });
    }
};
exports.verifyPayment = verifyPayment;
