"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { triggerNotificationCheck } from "@/utils/notificationUtils";

export interface CommunityPost {
  _id: string;
  content: string;
  timestamp: string;
  likeCount: number;
  commentCount: number;
  isLikedByUser: boolean;
  comments: CommunityComment[];
  author: {
    _id: string;
    name: string;
    role: "user" | "professional" | "admin";
  };
  createdAt: string;
  updatedAt: string;
}

export interface CommunityComment {
  id: string;
  content: string;
  timestamp: string;
  likes: number;
  isLikedByUser: boolean;
  author: {
    _id: string;
    name: string;
    role: "user" | "professional" | "admin";
  };
}

interface UseCommunityPostsReturn {
  posts: CommunityPost[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  createPost: (content: string) => Promise<boolean>;
  likePost: (postId: string) => Promise<void>;
  likeComment: (postId: string, commentId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  loadMore: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
  refresh: () => Promise<void>;
}

interface UseCommunityPostsConfig {
  postsPerPage?: number;
  paginationType?: "loadMore" | "pages";
}

export function useCommunityPosts(
  config: UseCommunityPostsConfig = {}
): UseCommunityPostsReturn {
  const { postsPerPage = 10 } = config;
  const { data: session } = useSession();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);

  const fetchPosts = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/community/posts?page=${pageNum}&limit=${postsPerPage}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }

        const data = await response.json();

        // Process posts to ensure proper typing
        const processedPosts: CommunityPost[] = data.posts.map(
          (post: {
            _id: string;
            content: string;
            timestamp: string;
            likeCount: number;
            commentCount: number;
            isLikedByUser: boolean;
            comments: {
              id: string;
              content: string;
              timestamp: string;
              likes: number;
              isLikedByUser: boolean;
              author: {
                _id: string;
                name: string;
                role: string;
              };
            }[];
            author: {
              _id: string;
              name: string;
              role: string;
            };
            createdAt: string;
            updatedAt: string;
          }) => ({
            ...post,
            timestamp: new Date(post.timestamp).toISOString(),
            createdAt: new Date(post.createdAt).toISOString(),
            updatedAt: new Date(post.updatedAt).toISOString(),
            comments: post.comments.map((comment) => ({
              ...comment,
              timestamp: new Date(comment.timestamp).toISOString(),
            })),
          })
        );

        if (append) {
          setPosts((prev) => [...prev, ...processedPosts]);
        } else {
          setPosts(processedPosts);
        }

        setHasMore(data.pagination.hasMore);
        setTotalPages(data.pagination.totalPages);
        setTotalPosts(data.pagination.totalCount);
        setPage(pageNum);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [session?.user?.id, postsPerPage]
  );

  const createPost = useCallback(
    async (content: string): Promise<boolean> => {
      if (!session?.user?.id || !content.trim()) return false;

      try {
        const response = await fetch("/api/community/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: content.trim() }),
        });

        if (!response.ok) {
          throw new Error("Failed to create post");
        }

        const data = await response.json();
        const newPost: CommunityPost = {
          ...data.post,
          timestamp: new Date(data.post.timestamp).toISOString(),
          createdAt: new Date(data.post.createdAt).toISOString(),
          updatedAt: new Date(data.post.updatedAt).toISOString(),
        };

        setPosts((prev) => [newPost, ...prev]);
        return true;
      } catch (err) {
        console.error("Error creating post:", err);
        setError(err instanceof Error ? err.message : "Failed to create post");
        return false;
      }
    },
    [session?.user?.id]
  );

  const likePost = useCallback(
    async (postId: string): Promise<void> => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`/api/community/posts/${postId}/like`, {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Failed to toggle like");
        }

        const data = await response.json();

        setPosts((prev) =>
          prev.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  isLikedByUser: data.isLiked,
                  likeCount: data.likeCount,
                }
              : post
          )
        );

        // Trigger notification check after liking (only if user liked, not unliked)
        if (data.isLiked) {
          triggerNotificationCheck();
        }
      } catch (err) {
        console.error("Error toggling like:", err);
        setError(err instanceof Error ? err.message : "Failed to toggle like");
      }
    },
    [session?.user?.id]
  );

  const likeComment = useCallback(
    async (postId: string, commentId: string): Promise<void> => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(
          `/api/community/posts/${postId}/comments/${commentId}/like`,
          {
            method: "POST",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to toggle comment like");
        }

        const data = await response.json();

        setPosts((prev) =>
          prev.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  comments: post.comments.map((comment) =>
                    comment.id === commentId
                      ? {
                          ...comment,
                          isLikedByUser: data.isLiked,
                          likes: data.likeCount,
                        }
                      : comment
                  ),
                }
              : post
          )
        );

        // Trigger notification check after liking comment (only if user liked, not unliked)
        if (data.isLiked) {
          triggerNotificationCheck();
        }
      } catch (err) {
        console.error("Error toggling comment like:", err);
        setError(
          err instanceof Error ? err.message : "Failed to toggle comment like"
        );
      }
    },
    [session?.user?.id]
  );

  const addComment = useCallback(
    async (postId: string, content: string): Promise<void> => {
      if (!session?.user?.id || !content.trim()) return;

      try {
        const response = await fetch(
          `/api/community/posts/${postId}/comments`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ content: content.trim() }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to add comment");
        }

        const data = await response.json();
        const newComment: CommunityComment = {
          ...data.comment,
          timestamp: new Date(data.comment.timestamp).toISOString(),
        };

        setPosts((prev) =>
          prev.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  comments: [...post.comments, newComment],
                  commentCount: post.commentCount + 1,
                }
              : post
          )
        );

        // Trigger notification check after adding comment
        triggerNotificationCheck();
      } catch (err) {
        console.error("Error adding comment:", err);
        setError(err instanceof Error ? err.message : "Failed to add comment");
      }
    },
    [session?.user?.id]
  );

  const loadMore = useCallback(async (): Promise<void> => {
    if (!hasMore || loading) return;
    await fetchPosts(page + 1, true);
  }, [hasMore, loading, page, fetchPosts]);

  const goToPage = useCallback(
    async (pageNum: number): Promise<void> => {
      if (pageNum < 1 || pageNum > totalPages || pageNum === page || loading)
        return;
      await fetchPosts(pageNum, false);
    },
    [totalPages, page, loading, fetchPosts]
  );

  const nextPage = useCallback(async (): Promise<void> => {
    if (page >= totalPages || loading) return;
    await fetchPosts(page + 1, false);
  }, [page, totalPages, loading, fetchPosts]);

  const prevPage = useCallback(async (): Promise<void> => {
    if (page <= 1 || loading) return;
    await fetchPosts(page - 1, false);
  }, [page, loading, fetchPosts]);

  const refresh = useCallback(async (): Promise<void> => {
    await fetchPosts(1, false);
  }, [fetchPosts]);

  // Initial load
  useEffect(() => {
    if (session?.user?.id) {
      fetchPosts(1, false);
    }
  }, [session?.user?.id, fetchPosts]);

  return {
    posts,
    loading,
    error,
    hasMore,
    currentPage: page,
    totalPages,
    totalPosts,
    createPost,
    likePost,
    likeComment,
    addComment,
    loadMore,
    goToPage,
    nextPage,
    prevPage,
    refresh,
  };
}
