import mongoose, { Schema, Document } from 'mongoose';

export interface IMedia {
  url: string;
  type: 'image' | 'video' | 'gif';
  width?: number;
  height?: number;
  thumbnail?: string;
  duration?: number;
}

export interface IPost extends Document {
  authorId: string;
  content: string;
  media: IMedia[];
  hashtags: string[];
  mentions: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema = new Schema<IMedia>({
  url: { type: String, required: true },
  type: { type: String, enum: ['image', 'video', 'gif'], required: true },
  width: Number,
  height: Number,
  thumbnail: String,
  duration: Number,
});

const PostSchema = new Schema<IPost>(
  {
    authorId: { type: String, required: true, index: true },
    content: { type: String, required: true, maxlength: 280 },
    media: [MediaSchema],
    hashtags: [{ type: String, index: true }],
    mentions: [{ type: String }],
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes
PostSchema.index({ authorId: 1, createdAt: -1 });
PostSchema.index({ hashtags: 1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ content: 'text' });

export const Post = mongoose.model<IPost>('Post', PostSchema);
