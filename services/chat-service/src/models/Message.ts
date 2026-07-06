import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  roomId: string;
  senderId: string;
  content: string;
  mediaUrl?: string;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    roomId: { type: String, required: true, index: true },
    senderId: { type: String, required: true, index: true },
    content: { type: String, required: true, maxlength: 2000 },
    mediaUrl: String,
    read: { type: Boolean, default: false },
    readAt: Date,
  },
  { timestamps: true }
);

MessageSchema.index({ roomId: 1, createdAt: -1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
