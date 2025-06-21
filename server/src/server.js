require('dotenv').config();
const http = require('http');
const app = require('./app');

// Get port from environment or default to 5000
const port = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Start server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});