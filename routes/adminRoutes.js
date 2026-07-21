const express = require("express");

const router = express.Router();

const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const {
    getAllUsers,
    getUser,
    updateUserRole,
    deleteUser,
    getDashboardStats
} = require("../controllers/adminController");

router.get("/dashboard", auth, admin, getDashboardStats);

router.get("/users", auth, admin, getAllUsers);

router.get("/users/:id", auth, admin, getUser);

router.put("/users/:id/role", auth, admin, updateUserRole);

router.delete("/users/:id", auth, admin, deleteUser);

module.exports = router;