import mongoose, { Schema, Document } from 'mongoose';

export interface ISave extends Document {
  postId: string;
  userId: string;
  createdAt: Date;
}

const SaveSchema = new Schema<ISave>(
  {
    postId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

SaveSchema.index({ postId: 1, userId: 1 }, { unique: true });

export const Save = mongoose.model<ISave>('Save', SaveSchema);
