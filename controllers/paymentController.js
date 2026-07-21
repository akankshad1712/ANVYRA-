const razorpayInstance = require("../config/razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");

// Create Razorpay Order (called after your /api/orders order already exists)
const createRazorpayOrder = async (req, res) => {
    try {

        const { orderId } = req.body;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order Not Found"
            });
        }

        if (order.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Not Authorized"
            });
        }

        const razorpayOrder = await razorpayInstance.orders.create({
            amount: Math.round(order.totalPrice * 100), // Razorpay uses paise
            currency: "INR",
            receipt: order._id.toString()
        });

        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        res.status(200).json({
            success: true,
            razorpayOrder,
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Verify Payment (called after Razorpay checkout completes on frontend)
const verifyPayment = async (req, res) => {
    try {

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId
        } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign)
            .digest("hex");

        if (expectedSign !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Payment Verification Failed"
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order Not Found"
            });
        }

        order.paymentStatus = "Paid";
        order.razorpayPaymentId = razorpay_payment_id;
        await order.save();

        res.status(200).json({
            success: true,
            message: "Payment Verified Successfully",
            order
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

module.exports = {
    createRazorpayOrder,
    verifyPayment
};