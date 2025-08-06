import mongoose from "mongoose";

export interface ICommunityPost extends mongoose.Document {
  author: mongoose.Types.ObjectId; // Reference to User
  content: string;
  timestamp: Date;
  likes: mongoose.Types.ObjectId[]; // Array of User IDs who liked
  comments: {
    id: string;
    author: mongoose.Types.ObjectId; // Reference to User
    content: string;
    timestamp: Date;
    likes: mongoose.Types.ObjectId[]; // Array of User IDs who liked the comment
  }[];
  isPublic: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const communityPostSchema = new mongoose.Schema<ICommunityPost>(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Post content is required"],
      maxlength: [2000, "Post content cannot exceed 2000 characters"],
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        id: {
          type: String,
          default: () => new mongoose.Types.ObjectId().toString(),
        },
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: {
          type: String,
          required: true,
          maxlength: [500, "Comment cannot exceed 500 characters"],
          trim: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        likes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
      },
    ],
    isPublic: {
      type: Boolean,
      default: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for performance
communityPostSchema.index({ timestamp: -1 });
communityPostSchema.index({ author: 1 });
communityPostSchema.index({ isPublic: 1, timestamp: -1 });

// Virtual for like count
communityPostSchema.virtual("likeCount").get(function () {
  return this.likes ? this.likes.length : 0;
});

// Virtual for comment count
communityPostSchema.virtual("commentCount").get(function () {
  return this.comments ? this.comments.length : 0;
});

// Method to check if user liked the post
communityPostSchema.methods.isLikedByUser = function (userId: string): boolean {
  return this.likes.some(
    (like: mongoose.Types.ObjectId) => like.toString() === userId
  );
};

// Method to add like
communityPostSchema.methods.addLike = function (userId: string): void {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  if (!this.isLikedByUser(userId)) {
    this.likes.push(userObjectId);
  }
};

// Method to remove like
communityPostSchema.methods.removeLike = function (userId: string): void {
  this.likes = this.likes.filter(
    (like: mongoose.Types.ObjectId) => like.toString() !== userId
  );
};

// Method to add comment
communityPostSchema.methods.addComment = function (
  userId: string,
  content: string
): string {
  const commentId = new mongoose.Types.ObjectId().toString();
  this.comments.push({
    id: commentId,
    author: new mongoose.Types.ObjectId(userId),
    content: content.trim(),
    timestamp: new Date(),
    likes: [],
  });
  return commentId;
};

// Method to like/unlike comment
communityPostSchema.methods.toggleCommentLike = function (
  commentId: string,
  userId: string
): boolean {
  const comment = this.comments.find(
    (c: {
      id: string;
      author: mongoose.Types.ObjectId;
      content: string;
      timestamp: Date;
      likes: mongoose.Types.ObjectId[];
    }) => c.id === commentId
  );
  if (!comment) return false;

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const hasLiked = comment.likes.some(
    (like: mongoose.Types.ObjectId) => like.toString() === userId
  );

  if (hasLiked) {
    comment.likes = comment.likes.filter(
      (like: mongoose.Types.ObjectId) => like.toString() !== userId
    );
  } else {
    comment.likes.push(userObjectId);
  }

  return !hasLiked; // Return new like status
};

const CommunityPost =
  mongoose.models.CommunityPost ||
  mongoose.model<ICommunityPost>("CommunityPost", communityPostSchema);

export default CommunityPost;
