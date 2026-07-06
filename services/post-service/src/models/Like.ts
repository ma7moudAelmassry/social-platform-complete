import mongoose, { Schema, Document } from 'mongoose';

export interface ILike extends Document {
  postId?: string;
  commentId?: string;
  userId: string;
  createdAt: Date;
}

const LikeSchema = new Schema<ILike>(
  {
    postId: { type: String, index: true },
    commentId: { type: String, index: true },
    userId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

LikeSchema.index({ postId: 1, userId: 1 }, { unique: true, sparse: true });
LikeSchema.index({ commentId: 1, userId: 1 }, { unique: true, sparse: true });

export const Like = mongoose.model<ILike>('Like', LikeSchema);
