import mongoose from "mongoose";

export interface INotification extends mongoose.Document {
  recipient: mongoose.Types.ObjectId; // User who receives the notification
  sender: mongoose.Types.ObjectId; // User who triggered the notification
  type: "like" | "comment" | "comment_like" | "follow" | "post_mention";
  title: string;
  message: string;
  isRead: boolean;

  // Context data
  postId?: mongoose.Types.ObjectId; // For post-related notifications
  commentId?: string; // For comment-related notifications

  // Metadata
  metadata?: {
    postContent?: string; // First 100 chars of post content
    commentContent?: string; // First 100 chars of comment content
  };

  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new mongoose.Schema<INotification>(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "comment", "comment_like", "follow", "post_mention"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommunityPost",
      required: false,
    },
    commentId: {
      type: String,
      required: false,
    },
    metadata: {
      postContent: String,
      commentContent: String,
    },
  },
  {
    timestamps: true,
  }
);

// Composite indexes for better performance
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

// Method to mark as read
notificationSchema.methods.markAsRead = function (): Promise<INotification> {
  this.isRead = true;
  return this.save();
};

// Static method to create post like notification
notificationSchema.statics.createPostLikeNotification = async function (
  senderId: string,
  recipientId: string,
  postId: string,
  postContent: string,
  senderName: string
) {
  if (senderId === recipientId) return null; // Don't notify yourself

  // Check if notification already exists (prevent spam)
  const existing = await this.findOne({
    sender: senderId,
    recipient: recipientId,
    type: "like",
    postId: postId,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Within last 24h
  });

  if (existing) return existing;

  return this.create({
    recipient: recipientId,
    sender: senderId,
    type: "like",
    title: "Nowe polubienie",
    message: `${senderName} polubił Twój post`,
    postId: postId,
    metadata: {
      postContent: postContent.substring(0, 100),
    },
  });
};

// Static method to create comment notification
notificationSchema.statics.createCommentNotification = async function (
  senderId: string,
  recipientId: string,
  postId: string,
  commentContent: string,
  postContent: string,
  senderName: string
) {
  if (senderId === recipientId) return null; // Don't notify yourself

  return this.create({
    recipient: recipientId,
    sender: senderId,
    type: "comment",
    title: "Nowy komentarz",
    message: `${senderName} skomentował Twój post`,
    postId: postId,
    metadata: {
      postContent: postContent.substring(0, 100),
      commentContent: commentContent.substring(0, 100),
    },
  });
};

// Static method to create comment like notification
notificationSchema.statics.createCommentLikeNotification = async function (
  senderId: string,
  recipientId: string,
  postId: string,
  commentId: string,
  commentContent: string,
  senderName: string
) {
  if (senderId === recipientId) return null; // Don't notify yourself

  // Check if notification already exists (prevent spam)
  const existing = await this.findOne({
    sender: senderId,
    recipient: recipientId,
    type: "comment_like",
    postId: postId,
    commentId: commentId,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Within last 24h
  });

  if (existing) return existing;

  return this.create({
    recipient: recipientId,
    sender: senderId,
    type: "comment_like",
    title: "Polubienie komentarza",
    message: `${senderName} polubił Twój komentarz`,
    postId: postId,
    commentId: commentId,
    metadata: {
      commentContent: commentContent.substring(0, 100),
    },
  });
};

const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", notificationSchema);

export default Notification;
