import express, { Application } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import usersRouter from './routes/users';
import invitationsRouter from './routes/invitations';
import attendanceRouter from './routes/attendance';
import eventsRouter from './routes/events';

// Load environment variables from root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app: Application = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/users', usersRouter);
app.use('/api/invitations', invitationsRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/events', eventsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Track active users per event
const eventUsers = new Map<string, Set<string>>();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Join event room (for flash sync)
  socket.on('joinEvent', ({ eventId, userId, sessionId }) => {
    socket.join(`event:${eventId}`);

    // Track user in event
    if (!eventUsers.has(eventId)) {
      eventUsers.set(eventId, new Set());
    }
    eventUsers.get(eventId)?.add(userId);

    // Notify all users in event about new attendee
    const activeCount = eventUsers.get(eventId)?.size || 0;
    io.to(`event:${eventId}`).emit('attendeeCountUpdate', {
      eventId,
      count: activeCount
    });

    console.log(`User ${userId} (${socket.id}) joined event ${eventId}. Active: ${activeCount}`);
  });

  // Leave event room
  socket.on('leaveEvent', ({ eventId, userId }) => {
    socket.leave(`event:${eventId}`);

    // Remove user from tracking
    eventUsers.get(eventId)?.delete(userId);

    // Clean up empty sets
    if (eventUsers.get(eventId)?.size === 0) {
      eventUsers.delete(eventId);
    }

    const activeCount = eventUsers.get(eventId)?.size || 0;
    io.to(`event:${eventId}`).emit('attendeeCountUpdate', {
      eventId,
      count: activeCount
    });

    console.log(`User ${userId} left event ${eventId}. Active: ${activeCount}`);
  });

  // Admin triggers flash for all checked-in users
  socket.on('triggerFlash', ({ eventId, color, duration, pattern }) => {
    console.log(`Admin triggering flash for event ${eventId}: ${color} for ${duration}ms`);

    // Broadcast flash to all users in event
    io.to(`event:${eventId}`).emit('flash', {
      color,
      duration,
      pattern,
      timestamp: Date.now(),
    });
  });

  // Admin updates flash settings
  socket.on('updateFlashSettings', ({ eventId, flashInterval, flashEnabled, colors }) => {
    console.log(`Updating flash settings for event ${eventId}`);

    io.to(`event:${eventId}`).emit('flashSettingsUpdated', {
      flashInterval,
      flashEnabled,
      colors,
    });
  });

  // Admin broadcasts event notification
  socket.on('sendEventNotification', ({ eventId, title, body }) => {
    console.log(`Sending notification for event ${eventId}`);

    io.to(`event:${eventId}`).emit('notification', {
      title,
      body,
      eventId,
      timestamp: Date.now(),
    });
  });

  // Get current active count for event
  socket.on('getActiveCount', ({ eventId }, callback) => {
    const count = eventUsers.get(eventId)?.size || 0;
    callback({ count });
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);

    // Clean up user from all events
    eventUsers.forEach((users, eventId) => {
      // Note: We can't easily track which user this socket belonged to
      // In production, you'd want to maintain a socket.id -> userId mapping
    });
  });
});

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io ready for connections`);
  console.log(`📍 API routes mounted at /api/*`);
});

export { app, io };
