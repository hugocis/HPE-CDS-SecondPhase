const express = require('express');
const path = require('path');
const app = express();

// Log all incoming requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for the root route
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    console.log('Attempting to serve:', indexPath);
    res.sendFile(indexPath);
});

const PORT = 5000;

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Something went wrong!');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Serving files from: ${path.join(__dirname, 'public')}`);
});