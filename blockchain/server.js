const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the public directory
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = 5050;
app.listen(port)
    .on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`Port ${port} is already in use. Please try a different port.`);
        } else if (err.code === 'EACCES') {
            console.error(`Port ${port} requires elevated privileges. Please try a different port.`);
        } else {
            console.error('Error starting server:', err);
        }
        process.exit(1);
    })
    .on('listening', () => {
        console.log(`Server running at http://localhost:${port}`);
    });