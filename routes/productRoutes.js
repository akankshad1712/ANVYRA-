const express = require("express");

const router = express.Router();

const auth = require("../middleware/authMiddleware");

const {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    createReview,
    getReviews,
    deleteReview
} = require("../controllers/productController");

router.post("/", createProduct);

router.get("/", getProducts);

router.get("/:id", getProduct);

router.put("/:id", updateProduct);

router.delete("/:id", deleteProduct);

router.post("/:id/reviews", auth, createReview);

router.get("/:id/reviews", getReviews);

router.delete("/:id/reviews/:reviewId", auth, deleteReview);

module.exports = router;