import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import adminRouter from './routes/admin.js';
import eventsRouter from './routes/events.js';
import guestsRouter from './routes/guests.js';
import { initSocket, setIoInstance } from './socket.js';
import http from 'http';

const app = express();
app.use(cors());
app.use(express.json());

// Mount routers
app.use('/api/admin', adminRouter);
app.use('/api/events', eventsRouter);
app.use('/api/guests', guestsRouter);

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/events';
mongoose
  .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3001;
const httpServer = http.createServer(app);
// Initialise Socket.io
const io = initSocket(httpServer);
// expose io for routes if needed
setIoInstance(io);

httpServer.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
