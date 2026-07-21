const Wishlist = require("../models/Wishlist");

// Add to Wishlist
const addToWishlist = async (req, res) => {
    try {

        const { product } = req.body;

        const exists = await Wishlist.findOne({
            user: req.user.id,
            product
        });

        if (exists) {
            return res.status(400).json({
                success: false,
                message: "Product already in wishlist"
            });
        }

        const wishlist = await Wishlist.create({
            user: req.user.id,
            product
        });

        res.status(201).json({
            success: true,
            wishlist
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Get Wishlist
const getWishlist = async (req, res) => {

    try {

        const wishlist = await Wishlist.find({
            user: req.user.id
        }).populate("product");

        res.json({
            success: true,
            count: wishlist.length,
            wishlist
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// Remove Wishlist Item
const removeWishlist = async (req, res) => {

    try {

        await Wishlist.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Removed from wishlist"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = {
    addToWishlist,
    getWishlist,
    removeWishlist
};