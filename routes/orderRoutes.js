const express = require("express");

const router = express.Router();

const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const {
    createOrder,
    getMyOrders,
    getOrder,
    getAllOrders,
    updateOrderStatus
} = require("../controllers/orderController");

router.post("/", auth, createOrder);

router.get("/my-orders", auth, getMyOrders);

router.get("/:id", auth, getOrder);

router.get("/", auth, admin, getAllOrders);

router.put("/:id/status", auth, admin, updateOrderStatus);

module.exports = router;