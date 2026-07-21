const express = require("express");

const router = express.Router();

const auth = require("../middleware/authMiddleware");

const {
    createRazorpayOrder,
    verifyPayment
} = require("../controllers/paymentController");

router.post("/create-order", auth, createRazorpayOrder);

router.post("/verify", auth, verifyPayment);

module.exports = router;