import { ChatRoom } from '../models/ChatRoom';
import { Message } from '../models/Message';
import { logger } from '../utils/logger';

export class ChatService {
  async getOrCreateRoom(participantIds: string[]) {
    // Sort to ensure consistent room lookup
    const sortedIds = [...participantIds].sort();

    let room = await ChatRoom.findOne({
      participants: { $all: sortedIds, $size: sortedIds.length },
    });

    if (!room) {
      room = await ChatRoom.create({ participants: sortedIds });
      logger.info('Chat room created', { roomId: room.id, participants: sortedIds });
    }

    return room;
  }

  async getRooms(userId: string) {
    const rooms = await ChatRoom.find({
      participants: userId,
    })
      .sort({ updatedAt: -1 })
      .lean();

    // Get unread count for each room
    const roomsWithUnread = await Promise.all(
      rooms.map(async (room) => {
        const unreadCount = await Message.countDocuments({
          roomId: room._id.toString(),
          senderId: { $ne: userId },
          read: false,
        });

        return {
          id: room._id.toString(),
          participants: room.participants.filter((id) => id !== userId),
          lastMessage: room.lastMessage,
          unreadCount,
          createdAt: room.createdAt,
          updatedAt: room.updatedAt,
        };
      })
    );

    return roomsWithUnread;
  }

  async getMessages(
    roomId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    data: Array<Record<string, any> & { id: string }>;
    pagination: { page: number; limit: number; total: number; hasMore: boolean };
  }> {
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      Message.find({ roomId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Message.countDocuments({ roomId }),
    ]);

    return {
      data: messages.reverse().map((msg) => ({
        id: msg._id.toString(),
        ...msg,
      })),
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + messages.length < total,
      },
    };
  }

  async sendMessage(roomId: string, senderId: string, content: string, mediaUrl?: string) {
    const message = await Message.create({
      roomId,
      senderId,
      content,
      mediaUrl,
    });

    // Update room's last message
    await ChatRoom.findByIdAndUpdate(roomId, {
      lastMessage: {
        content,
        senderId,
        createdAt: new Date(),
      },
    });

    return {
      id: message._id.toString(),
      roomId,
      senderId,
      content,
      mediaUrl,
      read: false,
      createdAt: message.createdAt,
    };
  }

  async markMessagesAsRead(roomId: string, userId: string) {
    await Message.updateMany(
      {
        roomId,
        senderId: { $ne: userId },
        read: false,
      },
      {
        read: true,
        readAt: new Date(),
      }
    );

    return { success: true };
  }

  async getUnreadCount(userId: string) {
    const rooms = await ChatRoom.find({ participants: userId }).lean();
    const roomIds = rooms.map((r) => r._id.toString());

    const count = await Message.countDocuments({
      roomId: { $in: roomIds },
      senderId: { $ne: userId },
      read: false,
    });

    return count;
  }
}

export const chatService = new ChatService();
