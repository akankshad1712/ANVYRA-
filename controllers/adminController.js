const User = require("../models/User");

// Get All Users
const getAllUsers = async (req, res) => {
    try {

        const users = await User.find().select("-password");

        res.status(200).json({
            success: true,
            count: users.length,
            users
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Get Single User
const getUser = async (req, res) => {
    try {

        const user = await User.findById(req.params.id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User Not Found"
            });
        }

        res.status(200).json({
            success: true,
            user
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Update User Role (promote/demote admin)
const updateUserRole = async (req, res) => {
    try {

        const { role } = req.body;

        if (!["user", "admin"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Role must be 'user' or 'admin'"
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User Not Found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User Role Updated",
            user
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Delete User
const deleteUser = async (req, res) => {
    try {

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User Not Found"
            });
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: "User Deleted"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Dashboard Stats (quick overview)
const getDashboardStats = async (req, res) => {
    try {

        const Order = require("../models/Order");
        const Product = require("../models/Product");

        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();

        const orders = await Order.find();
        const totalRevenue = orders
            .filter(o => o.paymentStatus === "Paid" || o.paymentMethod === "COD")
            .reduce((sum, o) => sum + o.totalPrice, 0);

        const ordersByStatus = {
            Processing: await Order.countDocuments({ orderStatus: "Processing" }),
            Shipped: await Order.countDocuments({ orderStatus: "Shipped" }),
            Delivered: await Order.countDocuments({ orderStatus: "Delivered" }),
            Cancelled: await Order.countDocuments({ orderStatus: "Cancelled" })
        };

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenue,
                ordersByStatus
            }
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

module.exports = {
    getAllUsers,
    getUser,
    updateUserRole,
    deleteUser,
    getDashboardStats
};