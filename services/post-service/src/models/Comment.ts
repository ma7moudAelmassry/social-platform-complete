import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  postId: string;
  authorId: string;
  content: string;
  likesCount: number;
  repliesCount: number;
  parentId?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    postId: { type: String, required: true, index: true },
    authorId: { type: String, required: true, index: true },
    content: { type: String, required: true, maxlength: 1000 },
    likesCount: { type: Number, default: 0 },
    repliesCount: { type: Number, default: 0 },
    parentId: { type: String, index: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CommentSchema.index({ postId: 1, createdAt: -1 });

export const Comment = mongoose.model<IComment>('Comment', CommentSchema);
