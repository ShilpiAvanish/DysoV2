const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Save purchase endpoint
app.post('/api/save-purchase', (req, res) => {
  console.log('Received save-purchase request:', req.body);
  res.json({ success: true, message: 'Test endpoint working' });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
}); 