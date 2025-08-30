import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMessage extends Document {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

const MessageSchema = new Schema<IMessage>({
  senderId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  receiverId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
});

MessageSchema.index({ senderId: 1, receiverId: 1 });
MessageSchema.index({ timestamp: -1 });

export default mongoose.models.Message ||
  mongoose.model<IMessage>("Message", MessageSchema);
