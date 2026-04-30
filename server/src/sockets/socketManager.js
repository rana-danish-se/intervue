import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import User from '../models/User.model.js';
import { handleInterviewSocket } from './interviewHandler.js';

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  // Authentication Middleware for Sockets
  io.use(async (socket, next) => {
    try {
      const cookies = socket.handshake.headers.cookie;
      if (!cookies) return next(new Error('Authentication error: No cookies found'));

      const parsedCookies = cookie.parse(cookies);
      const token = parsedCookies.accessToken;

      if (!token) return next(new Error('Authentication error: No token found'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) return next(new Error('Authentication error: User not found'));

      socket.user = user;
      next();
    } catch (err) {
      console.error('Socket Auth Error:', err.message);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.firstName} (${socket.id})`);

    // Handle Interview Room Logic
    handleInterviewSocket(io, socket);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

/*
FILE: src/sockets/socketManager.js
ROLE: Entry point for Socket.io logic. Handles connection initialization, 
      JWT authentication via cookies, and delegates event handling to domain-specific handlers.
IMPORTED BY:
  - server.js
*/
