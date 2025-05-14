const mongoose = require("mongoose");
require("dotenv").config(); // Ensure environment variables are loaded

const connectDB = async () => {
  try {
    // Removed deprecated options: useNewUrlParser, useUnifiedTopology
    // These are default in newer Mongoose versions.
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
