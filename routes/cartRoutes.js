const express = require("express");

const router = express.Router();

const auth = require("../middleware/authMiddleware");

const {
    addToCart,
    getCart,
    removeCart
} = require("../controllers/cartController");

router.post("/", auth, addToCart);

router.get("/", auth, getCart);

router.delete("/:id", auth, removeCart);

module.exports = router;