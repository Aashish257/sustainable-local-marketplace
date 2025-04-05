require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to database
connectDB();

// Routes
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);

// Start server
const PORT = process.env.PORT || 6000; // Changed to a less common port
const server = app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }
  throw err;
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
