import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Add comment to a post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await request.json();
    const { postId } = await params;

    if (!ObjectId.isValid(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    if (content.length > 500) {
      return NextResponse.json(
        { error: "Comment cannot exceed 500 characters" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if post exists
    const post = await db
      .collection("communityposts")
      .findOne({ _id: new ObjectId(postId) });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Create new comment
    const commentId = new ObjectId().toString();
    const newComment = {
      id: commentId,
      author: new ObjectId(session.user.id),
      content: content.trim(),
      timestamp: new Date(),
      likes: [],
    };

    // Add comment to post
    // @ts-expect-error - MongoDB types issue with $push
    await db.collection("communityposts").updateOne(
      { _id: new ObjectId(postId) },
      {
        $push: { comments: newComment },
      }
    );

    // Create notification for post author (only if commenter is not the post author)
    if (post.author && !post.author.equals(new ObjectId(session.user.id))) {
      await db.collection("notifications").insertOne({
        recipient: post.author,
        sender: new ObjectId(session.user.id),
        type: "comment",
        title: "Nowy komentarz",
        message: `${session.user.name || "Ktoś"} skomentował Twój post`,
        postId: new ObjectId(postId),
        metadata: {
          postContent: post.content?.substring(0, 100) || "",
          commentContent: content.trim().substring(0, 100),
        },
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Get user info for the response
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(session.user.id) });

    const responseComment = {
      id: commentId,
      content: content.trim(),
      timestamp: new Date(),
      likes: 0,
      isLikedByUser: false,
      author: {
        id: session.user.id,
        name: user?.name || user?.email?.split("@")[0] || "User",
        role: Array.isArray(user?.role) ? user.role[0] : user?.role || "user",
      },
    };

    return NextResponse.json({
      comment: responseComment,
      message: "Comment added successfully",
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
