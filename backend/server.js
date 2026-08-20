require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const express = require('express');
const path = require("path");
const session = require('express-session');
const fs = require('fs');
const http = require('http');
const { Translate } = require('@google-cloud/translate').v2; // Google Translate API
const { Server } = require('socket.io');

const google_cloud_api_key = process.env.GOOGLE_CLOUD_API_KEY;
if (!google_cloud_api_key) {
  console.warn('GOOGLE_CLOUD_API_KEY is not set — translate and text-to-speech features will fail. See backend/.env.example.');
}

// Import Google Generative AI
const { GoogleGenerativeAI } = require("@google/generative-ai");
const gemini_api_key = process.env.GEMINI_API_KEY;
if (!gemini_api_key) {
  throw new Error('GEMINI_API_KEY is not set. Add it to backend/.env (see .env.example).');
}

// Initialize GoogleGenerativeAI with the key and configuration
const googleAI = new GoogleGenerativeAI(gemini_api_key);
const geminiConfig = {
  temperature: 0.9,
  topP: 1,
  topK: 1,
  maxOutputTokens: 4096,
};
const geminiModel = googleAI.getGenerativeModel({
  model: "gemini-3.6-flash",
  geminiConfig,
});

const { db, countersRef } = require('./firebase'); 
const driverRouter = require('./routes/driver-router');
const packageRouter = require('./routes/package-router');

const app = express();
const PORT_NUMBER = 8080;
const translate = new Translate({ key: google_cloud_api_key }); // Initialize the Google Translate client
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust this to your frontend origin if needed
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(express.static(path.join(__dirname, '../dist/a3/browser')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

// API Routes
app.use('/32796021/api/v1/drivers', isAuthenticated, driverRouter);
app.use('/32796021/api/v1/packages', isAuthenticated, packageRouter);

// Static route to serve audio files
app.use('/audio', express.static(path.join(__dirname, 'audio')));

/**
 * Authentication Middleware
 */
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    res.redirect('/32796021/users/login');
  }
}

// Socket.io for Google Translate and Text-to-Speech
io.on('connection', (socket) => {
  console.log('New client connected');

  // Handle translation event
  socket.on('translate', async (data) => {
    const { description, targetLanguageCode } = data;
    if (!targetLanguageCode || !description) {
      console.error('Translation error: Missing target language or description.');
      socket.emit('translationError', { message: 'Missing target language or description.' });
      return;
    }
    try {
      const [translation] = await translate.translate(description, targetLanguageCode);
      socket.emit('translationResult', {
        description,
        languageChosen: data.languageChosen,
        translation
      });
      console.log('Translation sent:', translation);
    } catch (error) {
      console.error('Error translating text:', error);
      socket.emit('translationError', { message: 'Translation failed' });
    }
  });

  // Handle Text-to-Speech event
  socket.on('text-speech', async (data) => {
    const { text } = data;
    console.log('Received text for speech:', text);

    if (!text) {
      console.error('No text received, cannot process TTS');
      socket.emit('ttsError', { message: 'No text received for Text-to-Speech conversion.' });
      return;
    }
    
    try {
      const ttsResponse = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${google_cloud_api_key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { text },
            voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
            audioConfig: { audioEncoding: 'MP3' }
          })
        }
      );
      const ttsJson = await ttsResponse.json();
      if (!ttsResponse.ok) {
        throw new Error(ttsJson.error?.message || 'Text-to-Speech request failed');
      }
      const audioBuffer = Buffer.from(ttsJson.audioContent, 'base64');
      const fileName = `audio_${Date.now()}.mp3`;
      const filePath = path.join(__dirname, 'audio', fileName);

      // Ensure 'audio' directory exists
      if (!fs.existsSync(path.join(__dirname, 'audio'))) {
        fs.mkdirSync(path.join(__dirname, 'audio'));
      }

      // Write the audio content to a file
      fs.writeFile(filePath, audioBuffer, (err) => {
        if (err) {
          console.error('Error writing audio file:', err);
          socket.emit('ttsError', { message: 'Failed to synthesize speech.' });
          return;
        }
        console.log('Audio file written successfully:', filePath);

        // Send the audio file path back to the frontend
        const audioPath = `http://localhost:8080/audio/${fileName}`; // Full URL for frontend
        socket.emit('ttsSuccess', { audioPath });
      });
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      socket.emit('ttsError', { message: 'Failed to synthesize speech.' });
    }
  });

  // Handle distance calculation using Generative AI (if applicable)
  socket.on('getdistance', async (data) => {
    const { destination } = data;
    console.log('Calculating distance to:', destination);

    try {
      const result = await geminiModel.generateContent(`Distance from Melbourne to ${destination}?`);
      const ans = await result.response.text();
      console.log('Generated distance:', ans);
      socket.emit('distance', { distance: ans });
    } catch (error) {
      console.error('Error generating distance:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// MongoDB Connection
const url = 'mongodb://127.0.0.1:27017/';
async function connect() {
  try {
    await mongoose.connect(url);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
}
connect();

// User Signup
const usersRef = db.collection('users');
app.post('/32796021/api/v1/users/signup', async (req, res) => {
  const { username, password, confirmPassword } = req.body;
  console.log('Received signup request:', username, password, confirmPassword);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(username)) {
    console.log('Invalid email format'); // Log validation errors
    return res.status(400).json({ status: 'Invalid email or password' });
  }

  if (password.length < 5 || password.length > 10) {
    console.log('Invalid password length'); // Log validation errors
    return res.status(400).json({ status: 'Invalid email or password' });
  }

  if (password !== confirmPassword) {
    console.log('Passwords do not match'); // Log validation errors
    return res.status(400).json({ status: 'Invalid email or password' });
  }

  try {
    const userDoc = await usersRef.doc(username).get();
    if (userDoc.exists) {
      console.log('User already exists'); // Log if user already exists
      return res.status(400).json({ status: 'User already exists' });
    }

    await usersRef.doc(username).set({ username, password });
    res.status(201).json({ status: 'Signup successfully' });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ status: 'Error during signup' });
  }
});

// User Login
app.post('/32796021/api/v1/users/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ status: 'Username or password is missing' });
  }

  const userDoc = await usersRef.doc(username).get();
  if (!userDoc.exists || password !== userDoc.data().password) {
    return res.status(401).json({ status: 'Invalid username or password' });
  }

  const user = userDoc.data();
  req.session.user = user;
  res.json({ status: 'Login successfully' });
});

// Statistics Page
app.get('/32796021/Yash/stats', isAuthenticated, async (req, res) => {
  try {
    // Fetch stats from Firebase Firestore
    const doc = await countersRef.get();
    const firebaseStats = doc.exists ? doc.data() : { create: 0, retrieve: 0, update: 0, delete: 0 };

    // Send back the stats and counts
    res.json({
      create: firebaseStats.create,
      retrieve: firebaseStats.retrieve,
      update: firebaseStats.update,
      delete: firebaseStats.delete,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Catch-all for unknown routes
app.get("/*", (req, res) => {
  res.send('not found');
});

// Start the server
server.listen(PORT_NUMBER, () => {
  console.log(`Server is running on port ${PORT_NUMBER}`);
});