const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
{
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            name: String,
            image: String,
            price: Number,
            quantity: {
                type: Number,
                required: true
            }
        }
    ],

    shippingAddress: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        addressLine1: { type: String, required: true },
        addressLine2: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true }
    },

    paymentMethod: {
        type: String,
        enum: ["COD", "Razorpay"],
        default: "COD"
    },

    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid", "Failed"],
        default: "Pending"
    },

    razorpayOrderId: {
        type: String
    },

    razorpayPaymentId: {
        type: String
    },

    itemsPrice: {
        type: Number,
        required: true
    },

    shippingPrice: {
        type: Number,
        default: 0
    },

    totalPrice: {
        type: Number,
        required: true
    },

    orderStatus: {
        type: String,
        enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
        default: "Processing"
    },

    deliveredAt: {
        type: Date
    }

},
{
    timestamps: true
});

module.exports = mongoose.model("Order", orderSchema);