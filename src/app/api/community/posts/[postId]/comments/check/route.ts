import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Check for new comments in a post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await params;
    if (!ObjectId.isValid(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    const url = new URL(request.url);
    const lastCheckTime = url.searchParams.get("lastCheck");

    const client = await clientPromise;
    const db = client.db();

    // Get post with comments
    const post = await db
      .collection("communityposts")
      .aggregate([
        { $match: { _id: new ObjectId(postId) } },
        {
          $lookup: {
            from: "users",
            localField: "comments.author",
            foreignField: "_id",
            as: "commentAuthors",
          },
        },
        {
          $addFields: {
            comments: {
              $map: {
                input: "$comments",
                as: "comment",
                in: {
                  id: "$$comment.id",
                  content: "$$comment.content",
                  timestamp: "$$comment.timestamp",
                  likes: { $size: { $ifNull: ["$$comment.likes", []] } },
                  isLikedByUser: {
                    $in: [new ObjectId(session.user.id), { $ifNull: ["$$comment.likes", []] }],
                  },
                  author: {
                    $let: {
                      vars: {
                        author: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$commentAuthors",
                                cond: { $eq: ["$$this._id", "$$comment.author"] },
                              },
                            },
                            0,
                          ],
                        },
                      },
                      in: {
                        _id: "$$author._id",
                        name: "$$author.name",
                        role: {
                          $cond: {
                            if: { $isArray: "$$author.role" },
                            then: { $arrayElemAt: ["$$author.role", 0] },
                            else: { $ifNull: ["$$author.role", "user"] },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        { $project: { comments: 1, _id: 1 } },
      ])
      .toArray();

    if (!post || post.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const comments = post[0].comments || [];
    
    // Check if there are new comments since last check
    let hasNewComments = false;
    if (lastCheckTime) {
      const lastCheck = new Date(lastCheckTime);
      hasNewComments = comments.some((comment: { timestamp: string }) => 
        new Date(comment.timestamp) > lastCheck
      );
    } else {
      hasNewComments = true; // First check, assume there might be new comments
    }

    return NextResponse.json({
      hasNewComments,
      comments,
      lastCheck: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error checking comments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
