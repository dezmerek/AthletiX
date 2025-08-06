import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Toggle like on a post
export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = params;
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

    // Check if user already liked the post
    const hasLiked = post.likes?.some((like: ObjectId) => like.equals(userId));

    let isLiked;

    // Update the post
    if (hasLiked) {
      // @ts-expect-error - MongoDB types issue with ObjectId in $pull
      await db
        .collection("communityposts")
        .updateOne({ _id: new ObjectId(postId) }, { $pull: { likes: userId } });
      isLiked = false;
    } else {
      // @ts-expect-error - MongoDB types issue with ObjectId in $addToSet
      await db
        .collection("communityposts")
        .updateOne(
          { _id: new ObjectId(postId) },
          { $addToSet: { likes: userId } }
        );
      isLiked = true;
    }

    // Get updated like count
    const updatedPost = await db
      .collection("communityposts")
      .findOne({ _id: new ObjectId(postId) });

    const likeCount = updatedPost?.likes?.length || 0;

    return NextResponse.json({
      success: true,
      isLiked,
      likeCount,
    });
  } catch (error) {
    console.error("Error toggling post like:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
