'use client';

import { create } from 'zustand';
import { ChatRoom, Message } from '@/types';
import { api } from '@/lib/api';
import { socketClient } from '@/lib/socket';

interface ChatState {
  rooms: ChatRoom[];
  activeRoom: ChatRoom | null;
  messages: Record<string, Message[]>;
  isLoading: boolean;
  typingUsers: Record<string, string[]>;

  fetchRooms: () => Promise<void>;
  setActiveRoom: (room: ChatRoom | null) => void;
  fetchMessages: (roomId: string, page?: number) => Promise<void>;
  sendMessage: (roomId: string, content: string, mediaUrl?: string) => void;
  receiveMessage: (roomId: string, message: Message) => void;
  setTyping: (roomId: string, userId: string, isTyping: boolean) => void;
  createRoom: (participantId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  rooms: [],
  activeRoom: null,
  messages: {},
  isLoading: false,
  typingUsers: {},

  fetchRooms: async () => {
    try {
      const response = await api.getChatRooms();
      set({ rooms: response.data });
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    }
  },

  setActiveRoom: (room) => {
    const previousRoom = get().activeRoom;
    if (previousRoom) {
      socketClient.leaveRoom(previousRoom.id);
    }
    if (room) {
      socketClient.joinRoom(room.id);
      get().fetchMessages(room.id);
    }
    set({ activeRoom: room });
  },

  fetchMessages: async (roomId, page = 1) => {
    try {
      const response = await api.getMessages(roomId, page, 50);
      const newMessages = response.data.data || [];

      set((state) => ({
        messages: {
          ...state.messages,
          [roomId]: page === 1 ? newMessages : [...newMessages, ...state.messages[roomId]],
        },
      }));
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  },

  sendMessage: (roomId, content, mediaUrl) => {
    socketClient.sendMessage(roomId, content, mediaUrl);

    // Optimistic update
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      senderId: 'current-user',
      sender: {} as any,
      content,
      media: mediaUrl ? { id: '', url: mediaUrl, type: 'image', width: 0, height: 0 } : undefined,
      read: false,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      messages: {
        ...state.messages,
        [roomId]: [...(state.messages[roomId] || []), tempMessage],
      },
    }));
  },

  receiveMessage: (roomId, message) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [roomId]: [...(state.messages[roomId] || []), message],
      },
      rooms: state.rooms.map((r) =>
        r.id === roomId
          ? { ...r, lastMessage: message, updatedAt: new Date().toISOString() }
          : r
      ),
    }));
  },

  setTyping: (roomId, userId, isTyping) => {
    set((state) => {
      const currentTyping = state.typingUsers[roomId] || [];
      if (isTyping) {
        if (currentTyping.includes(userId)) return state;
        return {
          typingUsers: {
            ...state.typingUsers,
            [roomId]: [...currentTyping, userId],
          },
        };
      } else {
        return {
          typingUsers: {
            ...state.typingUsers,
            [roomId]: currentTyping.filter((id) => id !== userId),
          },
        };
      }
    });
  },

  createRoom: async (participantId) => {
    try {
      const response = await api.createChatRoom(participantId);
      const newRoom = response.data;
      set((state) => ({
        rooms: [newRoom, ...state.rooms],
        activeRoom: newRoom,
      }));
      socketClient.joinRoom(newRoom.id);
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  },
}));
