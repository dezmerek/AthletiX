import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Get community posts
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db();

    // Get posts with author information
    const posts = await db
      .collection("communityposts")
      .aggregate([
        {
          $match: {
            isPublic: true,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "authorInfo",
          },
        },
        {
          $unwind: "$authorInfo",
        },
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
            likeCount: { $size: { $ifNull: ["$likes", []] } },
            commentCount: { $size: { $ifNull: ["$comments", []] } },
            isLikedByUser: {
              $in: [new ObjectId(session.user.id), { $ifNull: ["$likes", []] }],
            },
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
                    $in: [
                      new ObjectId(session.user.id),
                      { $ifNull: ["$$comment.likes", []] },
                    ],
                  },
                  author: {
                    $let: {
                      vars: {
                        commentAuthor: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$commentAuthors",
                                cond: {
                                  $eq: ["$$this._id", "$$comment.author"],
                                },
                              },
                            },
                            0,
                          ],
                        },
                      },
                      in: {
                        id: "$$commentAuthor._id",
                        name: {
                          $ifNull: [
                            "$$commentAuthor.name",
                            {
                              $arrayElemAt: [
                                { $split: ["$$commentAuthor.email", "@"] },
                                0,
                              ],
                            },
                          ],
                        },
                        role: {
                          $cond: {
                            if: { $isArray: "$$commentAuthor.role" },
                            then: { $arrayElemAt: ["$$commentAuthor.role", 0] },
                            else: { $ifNull: ["$$commentAuthor.role", "user"] },
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
        {
          $project: {
            _id: 1,
            content: 1,
            timestamp: 1,
            likeCount: 1,
            commentCount: 1,
            isLikedByUser: 1,
            comments: 1,
            createdAt: 1,
            updatedAt: 1,
            author: {
              _id: "$authorInfo._id",
              name: {
                $ifNull: [
                  "$authorInfo.name",
                  {
                    $arrayElemAt: [{ $split: ["$authorInfo.email", "@"] }, 0],
                  },
                ],
              },
              role: {
                $cond: {
                  if: { $isArray: "$authorInfo.role" },
                  then: { $arrayElemAt: ["$authorInfo.role", 0] },
                  else: { $ifNull: ["$authorInfo.role", "user"] },
                },
              },
            },
          },
        },
        {
          $sort: { timestamp: -1 },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ])
      .toArray();

    // Get total count for pagination
    const totalCount = await db
      .collection("communityposts")
      .countDocuments({ isPublic: true });

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + posts.length < totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching community posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create new community post
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, tags } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Post content is required" },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: "Post content cannot exceed 2000 characters" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const newPost = {
      author: new ObjectId(session.user.id),
      content: content.trim(),
      timestamp: new Date(),
      likes: [],
      comments: [],
      isPublic: true,
      tags: tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("communityposts").insertOne(newPost);

    // Get the created post with author info
    const createdPost = await db
      .collection("communityposts")
      .aggregate([
        {
          $match: { _id: result.insertedId },
        },
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "authorInfo",
          },
        },
        {
          $unwind: "$authorInfo",
        },
        {
          $project: {
            _id: 1,
            content: 1,
            timestamp: 1,
            likes: 1,
            comments: 1,
            createdAt: 1,
            updatedAt: 1,
            likeCount: { $size: { $ifNull: ["$likes", []] } },
            commentCount: { $size: { $ifNull: ["$comments", []] } },
            isLikedByUser: {
              $in: [new ObjectId(session.user.id), { $ifNull: ["$likes", []] }],
            },
            author: {
              _id: "$authorInfo._id",
              name: {
                $ifNull: [
                  "$authorInfo.name",
                  {
                    $arrayElemAt: [{ $split: ["$authorInfo.email", "@"] }, 0],
                  },
                ],
              },
              role: {
                $cond: {
                  if: { $isArray: "$authorInfo.role" },
                  then: { $arrayElemAt: ["$authorInfo.role", 0] },
                  else: { $ifNull: ["$authorInfo.role", "user"] },
                },
              },
            },
          },
        },
      ])
      .toArray();

    return NextResponse.json({
      post: createdPost[0],
      message: "Post created successfully",
    });
  } catch (error) {
    console.error("Error creating community post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
