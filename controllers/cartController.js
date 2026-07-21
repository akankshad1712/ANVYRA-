const Cart = require("../models/Cart");

// Add to Cart
const addToCart = async (req, res) => {
    try {
      console.log("BODY RECEIVED:", req.body);

        const { product, quantity, size } = req.body;

        const query = {
            user: req.user.id,
            product
        };
        if (typeof size === "string" && size.trim()) {
            query.size = size;
        } else {
            query.size = { $in: [null, ""] };
        }

        const existing = await Cart.findOne(query);

        if (existing) {

            existing.quantity += quantity || 1;
            await existing.save();

            return res.json({
                success: true,
                message: "Cart Updated",
                cart: existing
            });

        }

        const cartData = {
            user: req.user.id,
            product,
            quantity: quantity || 1
        };
        if (typeof size === "string" && size.trim()) {
            cartData.size = size;
        }

        const cart = await Cart.create(cartData);

        res.status(201).json({
            success: true,
            message: "Added to Cart",
            cart
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Get Cart
const getCart = async (req, res) => {

    try {

        const cart = await Cart.find({
            user: req.user.id
        }).populate("product");

        res.json({
            success: true,
            count: cart.length,
            cart
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// Remove Cart Item
const removeCart = async (req, res) => {

    try {

        await Cart.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Item Removed"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = {
    addToCart,
    getCart,
    removeCart
};