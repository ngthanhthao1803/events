import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { verifyToken } from './utils/jwt.js';

/**
 * Initialise Socket.io on the given HTTP server.
 * Returns the `io` instance so routes can emit events.
 */
export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    // you can configure more options here
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      socket.role = 'guest';
      return next();
    }
    const payload = verifyToken(token);
    if (!payload) return next(new Error('Invalid token'));
    // attach admin info to socket (if needed later)
    socket.admin = payload;
    socket.role = 'admin';
    next();
  });

  io.on('connection', (socket) => {
    // admin tells which event room to join
    socket.on('joinEvent', (eventId) => {
      if (eventId) socket.join(eventId);
    });
    // optional: handle disconnect
    socket.on('disconnect', () => {
      // console.log('socket disconnected');
    });
  });

  return io;
};

export let ioInstance = null;
export const setIoInstance = (instance) => {
  ioInstance = instance;
};
