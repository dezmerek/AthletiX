import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Toggle like on a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string; commentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId, commentId } = await params;

    if (!ObjectId.isValid(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const userId = new ObjectId(session.user.id);

    // Check if post exists
    const post = await db
      .collection("communityposts")
      .findOne({ _id: new ObjectId(postId) });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Find the comment
    const comment = post.comments?.find(
      (c: { id: string; likes?: ObjectId[] }) => c.id === commentId
    );
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Check if user already liked the comment
    const hasLiked = comment.likes?.some((like: ObjectId) =>
      like.equals(userId)
    );

    let isLiked;

    // Update the comment likes
    if (hasLiked) {
      // Remove like
      await db.collection("communityposts").updateOne(
        {
          _id: new ObjectId(postId),
          "comments.id": commentId,
        },
        {
          $pull: { "comments.$.likes": userId },
        } as object
      );
      isLiked = false;
    } else {
      // Add like
      await db.collection("communityposts").updateOne(
        {
          _id: new ObjectId(postId),
          "comments.id": commentId,
        },
        {
          $addToSet: { "comments.$.likes": userId },
        } as object
      );
      isLiked = true;
    }

    // Get updated comment to return like count
    const updatedPost = await db
      .collection("communityposts")
      .findOne({ _id: new ObjectId(postId) });

    const updatedComment = updatedPost?.comments?.find(
      (c: { id: string; likes?: ObjectId[] }) => c.id === commentId
    );
    const likeCount = updatedComment?.likes?.length || 0;

    return NextResponse.json({
      success: true,
      isLiked,
      likeCount,
    });
  } catch (error) {
    console.error("Error toggling comment like:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
