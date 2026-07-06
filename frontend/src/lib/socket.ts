'use client';

import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8080';

class SocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect() {
    if (this.socket?.connected) return;

    const token = Cookies.get('token');

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.socket?.disconnect();
      }
    });

    return this.socket;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  getSocket() {
    return this.socket;
  }

  // Chat events
  joinRoom(roomId: string) {
    this.socket?.emit('chat:join', { roomId });
  }

  leaveRoom(roomId: string) {
    this.socket?.emit('chat:leave', { roomId });
  }

  sendMessage(roomId: string, content: string, mediaUrl?: string) {
    this.socket?.emit('chat:message', { roomId, content, mediaUrl });
  }

  onNewMessage(callback: (message: any) => void) {
    this.socket?.on('chat:new_message', callback);
  }

  onTyping(callback: (data: { roomId: string; userId: string }) => void) {
    this.socket?.on('chat:typing', callback);
  }

  emitTyping(roomId: string) {
    this.socket?.emit('chat:typing', { roomId });
  }

  // Notification events
  onNotification(callback: (notification: any) => void) {
    this.socket?.on('notification:new', callback);
  }

  // Presence events
  onUserOnline(callback: (data: { userId: string }) => void) {
    this.socket?.on('presence:online', callback);
  }

  onUserOffline(callback: (data: { userId: string }) => void) {
    this.socket?.on('presence:offline', callback);
  }

  // Post events
  onPostLike(callback: (data: { postId: string; userId: string }) => void) {
    this.socket?.on('post:like', callback);
  }

  onPostComment(callback: (data: { postId: string; comment: any }) => void) {
    this.socket?.on('post:comment', callback);
  }

  // Remove listeners
  off(event: string) {
    this.socket?.off(event);
  }
}

export const socketClient = new SocketClient();
export default socketClient;
