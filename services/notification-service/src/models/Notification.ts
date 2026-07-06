import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipientId: string;
  actorId: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'message' | 'share';
  targetId?: string;
  targetType?: 'post' | 'comment' | 'user' | 'message';
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientId: { type: String, required: true, index: true },
    actorId: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['like', 'comment', 'follow', 'mention', 'message', 'share'], 
      required: true 
    },
    targetId: String,
    targetType: { type: String, enum: ['post', 'comment', 'user', 'message'] },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipientId: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
