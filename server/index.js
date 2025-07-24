const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path'); // ✅ Import the 'path' module
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// === Middleware ===
app.use(cors());
app.use(express.json());

// === API Routes ===
// Your API routes should come first
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/users', require('./routes/users'));

// === Serve Static Assets in Production ===
// This block of code will only run in a production environment
if (process.env.NODE_ENV === 'production') {
    // Set the static folder from the 'build' directory of the client
    app.use(express.static(path.join(__dirname, '../build')));

    // A "catch-all" route to serve the index.html for any other request
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../', 'build', 'index.html'));
    });
}


// === Start the server ===
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});