const Product = require("../models/Product");

// Create Product
const createProduct = async (req, res) => {
    try {

        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            message: "Product Created Successfully",
            product
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Get All Products (with search, filters, sort, pagination)
const getProducts = async (req, res) => {

    try {

        const {
            keyword,
            category,
            brand,
            minPrice,
            maxPrice,
            size,
            color,
            featured,
            sort,
            page,
            limit
        } = req.query;

        const query = {};

        // Search by name or description
        if (keyword) {
            query.$or = [
                { name: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } }
            ];
        }

        // Filter by category
        if (category) {
            query.category = category;
        }

        // Filter by brand
        if (brand) {
            query.brand = brand;
        }

        // Filter by price range
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Filter by size (matches if the array contains this size)
        if (size) {
            query.sizes = size;
        }

        // Filter by color
        if (color) {
            query.colors = color;
        }

        // Filter featured only
        if (featured === "true") {
            query.featured = true;
        }

        // Sorting
        let sortOption = { createdAt: -1 }; // default: newest first

        if (sort === "price_asc") sortOption = { price: 1 };
        if (sort === "price_desc") sortOption = { price: -1 };
        if (sort === "rating") sortOption = { rating: -1 };
        if (sort === "newest") sortOption = { createdAt: -1 };

        // Pagination
        const pageNumber = Number(page) || 1;
        const pageSize = Number(limit) || 12;
        const skip = (pageNumber - 1) * pageSize;

        const totalProducts = await Product.countDocuments(query);

        const products = await Product.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(pageSize);

        res.status(200).json({
            success: true,
            count: products.length,
            totalProducts,
            totalPages: Math.ceil(totalProducts / pageSize),
            currentPage: pageNumber,
            products
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// Get Single Product
const getProduct = async (req, res) => {

    try {

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product Not Found"
            });
        }

        res.status(200).json({
            success: true,
            product
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// Update Product
const updateProduct = async (req, res) => {

    try {

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product Not Found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product Updated",
            product
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};
// Create Review
const createReview = async (req, res) => {
    try {

        const { rating, comment } = req.body;

        if (!rating || !comment) {
            return res.status(400).json({
                success: false,
                message: "Rating and comment are required"
            });
        }

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product Not Found"
            });
        }

        // Prevent duplicate reviews from the same user
        const alreadyReviewed = product.reviews.find(
            (r) => r.user.toString() === req.user.id
        );

        if (alreadyReviewed) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed this product"
            });
        }

        const review = {
            user: req.user.id,
            name: req.user.name || "Anonymous",
            rating: Number(rating),
            comment
        };

        product.reviews.push(review);

        product.numReviews = product.reviews.length;

        product.rating =
            product.reviews.reduce((sum, r) => sum + r.rating, 0) /
            product.reviews.length;

        await product.save();

        res.status(201).json({
            success: true,
            message: "Review Added",
            product
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Get Reviews for a Product
const getReviews = async (req, res) => {
    try {

        const product = await Product.findById(req.params.id).select("reviews rating numReviews");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product Not Found"
            });
        }

        res.status(200).json({
            success: true,
            rating: product.rating,
            numReviews: product.numReviews,
            reviews: product.reviews
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Delete Review (only the review's author, or admin)
const deleteReview = async (req, res) => {
    try {

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product Not Found"
            });
        }

        const review = product.reviews.find(
            (r) => r._id.toString() === req.params.reviewId
        );

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review Not Found"
            });
        }

        if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Not Authorized"
            });
        }

        product.reviews = product.reviews.filter(
            (r) => r._id.toString() !== req.params.reviewId
        );

        product.numReviews = product.reviews.length;

        product.rating =
            product.reviews.length > 0
                ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
                : 0;

        await product.save();

        res.status(200).json({
            success: true,
            message: "Review Deleted",
            product
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Delete Product
const deleteProduct = async (req, res) => {

    try {

        const product = await Product.findById(req.params.id);

        if (!product) {

            return res.status(404).json({
                success: false,
                message: "Product Not Found"
            });

        }

        await product.deleteOne();

        res.status(200).json({
            success: true,
            message: "Product Deleted"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    createReview,
    getReviews,
    deleteReview
};