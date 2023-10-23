const express = require('express');
const connectDB = require('./config/db');
const addressRoutes = require('./routes/addressRoutes');
const middleware = require('./middleware/middleware');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // For parsing JSON request bodies

// Global middleware
app.use(middleware.logger)
app.use(middleware.authentication)

// Address routes
app.use('/', addressRoutes);

// Connect to MongoDB
connectDB();

// Listen on PORT
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

module.exports = app;