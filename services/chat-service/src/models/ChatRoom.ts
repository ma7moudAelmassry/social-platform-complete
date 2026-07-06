import mongoose, { Schema, Document } from 'mongoose';

export interface IChatRoom extends Document {
  participants: string[];
  lastMessage?: {
    content: string;
    senderId: string;
    createdAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ChatRoomSchema = new Schema<IChatRoom>(
  {
    participants: [{ type: String, required: true, index: true }],
    lastMessage: {
      content: String,
      senderId: String,
      createdAt: Date,
    },
  },
  { timestamps: true }
);

ChatRoomSchema.index({ participants: 1 });
ChatRoomSchema.index({ updatedAt: -1 });

export const ChatRoom = mongoose.model<IChatRoom>('ChatRoom', ChatRoomSchema);
