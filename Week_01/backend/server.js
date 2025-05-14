const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// CORS Middleware
app.use(cors()); // Allow requests from your frontend

// Body Parser Middleware
app.use(express.json()); // To accept JSON data in req.body

// Mount routers
app.use("/api/users", userRoutes);

// Basic Error Handling (can be improved)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
