import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Constants from 'expo-constants';

const SOCKET_URL = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export interface FlashEvent {
  color: string;
  duration: number;
  pattern?: string;
  timestamp: number;
}

export interface AttendeeCountUpdate {
  eventId: string;
  count: number;
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError(err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  /**
   * Join an event room for flash synchronization
   */
  const joinEvent = (eventId: string, userId: string, sessionId: string) => {
    if (!socketRef.current) return;

    socketRef.current.emit('joinEvent', {
      eventId,
      userId,
      sessionId,
    });

    console.log(`📍 Joined event ${eventId}`);
  };

  /**
   * Leave an event room
   */
  const leaveEvent = (eventId: string, userId: string) => {
    if (!socketRef.current) return;

    socketRef.current.emit('leaveEvent', {
      eventId,
      userId,
    });

    console.log(`🚪 Left event ${eventId}`);
  };

  /**
   * Trigger flash for an event (admin only)
   */
  const triggerFlash = (
    eventId: string,
    color: string,
    duration: number,
    pattern?: string
  ) => {
    if (!socketRef.current) return;

    socketRef.current.emit('triggerFlash', {
      eventId,
      color,
      duration,
      pattern,
    });

    console.log(`⚡ Triggered flash for event ${eventId}`);
  };

  /**
   * Update flash settings for an event (admin only)
   */
  const updateFlashSettings = (
    eventId: string,
    flashInterval: number,
    flashEnabled: boolean,
    colors: { color1: string; color2: string }
  ) => {
    if (!socketRef.current) return;

    socketRef.current.emit('updateFlashSettings', {
      eventId,
      flashInterval,
      flashEnabled,
      colors,
    });
  };

  /**
   * Send notification to event attendees (admin only)
   */
  const sendEventNotification = (eventId: string, title: string, body: string) => {
    if (!socketRef.current) return;

    socketRef.current.emit('sendEventNotification', {
      eventId,
      title,
      body,
    });
  };

  /**
   * Get current active count for an event
   */
  const getActiveCount = (eventId: string, callback: (data: { count: number }) => void) => {
    if (!socketRef.current) return;

    socketRef.current.emit('getActiveCount', { eventId }, callback);
  };

  /**
   * Listen for flash events
   */
  const onFlash = (callback: (data: FlashEvent) => void) => {
    if (!socketRef.current) return;

    socketRef.current.on('flash', callback);

    return () => {
      socketRef.current?.off('flash', callback);
    };
  };

  /**
   * Listen for attendee count updates
   */
  const onAttendeeCountUpdate = (callback: (data: AttendeeCountUpdate) => void) => {
    if (!socketRef.current) return;

    socketRef.current.on('attendeeCountUpdate', callback);

    return () => {
      socketRef.current?.off('attendeeCountUpdate', callback);
    };
  };

  /**
   * Listen for flash settings updates
   */
  const onFlashSettingsUpdated = (
    callback: (data: { flashInterval: number; flashEnabled: boolean; colors: any }) => void
  ) => {
    if (!socketRef.current) return;

    socketRef.current.on('flashSettingsUpdated', callback);

    return () => {
      socketRef.current?.off('flashSettingsUpdated', callback);
    };
  };

  /**
   * Listen for notifications
   */
  const onNotification = (
    callback: (data: { title: string; body: string; eventId: string; timestamp: number }) => void
  ) => {
    if (!socketRef.current) return;

    socketRef.current.on('notification', callback);

    return () => {
      socketRef.current?.off('notification', callback);
    };
  };

  return {
    socket: socketRef.current,
    isConnected,
    error,
    joinEvent,
    leaveEvent,
    triggerFlash,
    updateFlashSettings,
    sendEventNotification,
    getActiveCount,
    onFlash,
    onAttendeeCountUpdate,
    onFlashSettingsUpdated,
    onNotification,
  };
}
