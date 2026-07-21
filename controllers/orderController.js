const Order = require("../models/Order");
const Cart = require("../models/Cart");

// Create Order (from Cart)
const createOrder = async (req, res) => {
    try {

        const { shippingAddress, paymentMethod } = req.body;

        const cartItems = await Cart.find({ user: req.user.id }).populate("product");

        if (!cartItems.length) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }

        const items = cartItems.map((item) => ({
            product: item.product._id,
            name: item.product.name,
            image: item.product.images?.[0] || "",
            price: item.product.discountPrice || item.product.price,
            quantity: item.quantity
        }));

        const itemsPrice = items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        const shippingPrice = itemsPrice > 999 ? 0 : 99;
        const totalPrice = itemsPrice + shippingPrice;

        const order = await Order.create({
            user: req.user.id,
            items,
            shippingAddress,
            paymentMethod: paymentMethod || "COD",
            itemsPrice,
            shippingPrice,
            totalPrice
        });

        // Clear cart after order is placed
        await Cart.deleteMany({ user: req.user.id });

        res.status(201).json({
            success: true,
            message: "Order Placed Successfully",
            order
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Get Logged-in User's Orders
const getMyOrders = async (req, res) => {

    try {

        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            orders
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// Get Single Order
const getOrder = async (req, res) => {

    try {

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order Not Found"
            });
        }

        // Ensure user can only view their own order (unless admin)
        if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Not Authorized"
            });
        }

        res.json({
            success: true,
            order
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// Get All Orders (Admin only)
const getAllOrders = async (req, res) => {

    try {

        const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            orders
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// Update Order Status (Admin only)
const updateOrderStatus = async (req, res) => {

    try {

        const { orderStatus } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order Not Found"
            });
        }

        order.orderStatus = orderStatus;

        if (orderStatus === "Delivered") {
            order.deliveredAt = Date.now();
        }

        await order.save();

        res.json({
            success: true,
            message: "Order Status Updated",
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
    createOrder,
    getMyOrders,
    getOrder,
    getAllOrders,
    updateOrderStatus
};