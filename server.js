const express = require("express");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

connectDB();

const app = express();

// CORS for frontend access
app.use(cors());

app.use(express.json());

// Root splash page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "Website", "splash.html"));
});

// Serve static frontend files from the Website directory
app.use(express.static(path.join(__dirname, "..", "Website")));

// Serve LOGOs directory so images can be accessed
app.use("/LOGOs", express.static(path.join(__dirname, "..", "LOGOs")));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/categories",require("./routes/categoryRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Serve frontend HTML pages with clean URLs
app.get("/pages/:pageName", (req, res) => {
    const { pageName } = req.params;
    const allowedPages = ["about","admin","cart","checkout","collection","contact","forgot-password","login","product","register","wishlist"];
    if (allowedPages.includes(pageName)) {
        res.sendFile(path.join(__dirname, "..", "Website", "pages", `${pageName}.html`));
    } else {
        res.status(404).send("Page Not Found");
    }
});

// Fallback: serve index.html for any unmatched routes
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "Website", "index.html"));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 ANVYRA running on http://localhost:${PORT}`);
});
