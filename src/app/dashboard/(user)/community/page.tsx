"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useOnlineUsers } from "@/hooks/useOnlineUsers";

interface CommunityPost {
  id: string;
  author: {
    name: string;
    role: "user" | "trainer" | "nutritionist";
  };
  content: string;
  timestamp: Date;
  likes: number;
  isLiked: boolean;
  comments: Comment[];
  showComments: boolean;
}

interface Comment {
  id: string;
  author: {
    name: string;
    role: "user" | "trainer" | "nutritionist";
  };
  content: string;
  timestamp: Date;
  likes: number;
  isLiked: boolean;
}

export default function CommunityPage() {
  const t = useTranslations("community");
  const [newPost, setNewPost] = useState("");
  const [newComments, setNewComments] = useState<Record<string, string>>({});

  // Online users data
  const {
    onlineUsers,
    recentlyActiveUsers,
    totalOnline,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useOnlineUsers({
    enabled: true,
    refreshInterval: 15000, // 15 seconds for faster updates
  });
  // Podstawowe przykładowe posty
  const [posts, setPosts] = useState<CommunityPost[]>([
    {
      id: "1",
      author: {
        name: "Anna Kowalska",
        role: "trainer",
      },
      content:
        "Dziś świetny trening siłowy! 💪 Pamiętajcie - consistency is key. Małe kroki każdego dnia prowadzą do wielkich zmian.",
      timestamp: new Date("2025-06-16T08:30:00"),
      likes: 24,
      isLiked: false,
      showComments: false,
      comments: [
        {
          id: "c1",
          author: { name: "Michał Nowak", role: "user" },
          content: "Dzięki za motywację! Właśnie wracam z treningu 🔥",
          timestamp: new Date("2025-06-16T09:15:00"),
          likes: 5,
          isLiked: false,
        },
        {
          id: "c2",
          author: { name: "Dr. Maria Zielińska", role: "nutritionist" },
          content:
            "Świetne podejście! Pamiętaj też o odpowiedniej regeneracji 😊",
          timestamp: new Date("2025-06-16T10:00:00"),
          likes: 3,
          isLiked: true,
        },
      ],
    },
    {
      id: "2",
      author: {
        name: "Michał Nowak",
        role: "user",
      },
      content:
        "Pierwszy miesiąc z AthletiX za mną! -3kg i znacznie lepsza kondycja. Dziękuję za wsparcie! 🎉",
      timestamp: new Date("2025-06-16T07:15:00"),
      likes: 45,
      isLiked: true,
      showComments: false,
      comments: [
        {
          id: "c3",
          author: { name: "Anna Kowalska", role: "trainer" },
          content: "Gratulacje! Świetny wynik! 👏",
          timestamp: new Date("2025-06-16T07:30:00"),
          likes: 8,
          isLiked: false,
        },
      ],
    },
    {
      id: "3",
      author: {
        name: "Dr. Maria Zielińska",
        role: "nutritionist",
      },
      content:
        "Pytanie dnia: Jakie są wasze ulubione źródła białka roślinnego? Dzielcie się przepisami! 🌱",
      timestamp: new Date("2025-06-15T19:45:00"),
      likes: 18,
      isLiked: false,
      showComments: false,
      comments: [],
    },
  ]);
  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleCommentLike = (postId: string, commentId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === commentId
                  ? {
                      ...comment,
                      isLiked: !comment.isLiked,
                      likes: comment.isLiked
                        ? comment.likes - 1
                        : comment.likes + 1,
                    }
                  : comment
              ),
            }
          : post
      )
    );
  };

  const toggleComments = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              showComments: !post.showComments,
            }
          : post
      )
    );
  };

  const addComment = (postId: string, content: string) => {
    if (!content.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      author: {
        name: "Użytkownik",
        role: "user",
      },
      content: content.trim(),
      timestamp: new Date(),
      likes: 0,
      isLiked: false,
    };

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [...post.comments, newComment],
              showComments: true,
            }
          : post
      )
    );
  };
  const handleCreatePost = () => {
    if (!newPost.trim()) return;

    const post: CommunityPost = {
      id: Date.now().toString(),
      author: {
        name: "Użytkownik",
        role: "user",
      },
      content: newPost,
      timestamp: new Date(),
      likes: 0,
      isLiked: false,
      comments: [],
      showComments: false,
    };

    setPosts((prev) => [post, ...prev]);
    setNewPost("");
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "trainer":
        return "🏋️";
      case "nutritionist":
        return "🥗";
      case "admin":
        return "👑";
      default:
        return "👤";
    }
  };
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "trainer":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
      case "nutritionist":
        return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
      case "admin":
        return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400";
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m temu`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h temu`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d temu`;
    }
  };
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{t("description")}</p>
        </div>

        {/* Content Layout */}
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Create Post */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t("createPost.title")}
              </h3>

              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder={t("createPost.placeholder")}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                rows={3}
              />

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleCreatePost}
                  disabled={!newPost.trim()}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t("createPost.publish")}
                </button>
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-6">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
                >
                  {/* Post Header */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">
                        {post.author.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {post.author.name}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                            post.author.role
                          )}`}
                        >
                          {getRoleIcon(post.author.role)}{" "}
                          {t(`roles.${post.author.role}`)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatTimestamp(post.timestamp)}
                      </p>
                    </div>
                  </div>

                  {/* Post Content */}
                  <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                    {post.content}
                  </p>

                  {/* Post Actions */}
                  <div className="flex items-center space-x-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center space-x-2 transition-colors ${
                        post.isLiked
                          ? "text-red-500"
                          : "text-gray-500 dark:text-gray-400 hover:text-red-500"
                      }`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill={post.isLiked ? "currentColor" : "none"}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <span className="text-sm font-medium">{post.likes}</span>
                    </button>{" "}
                    <button
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>{" "}
                      <span className="text-sm font-medium">
                        {post.comments.length > 0
                          ? `${post.comments.length} ${t("actions.comment")}${
                              post.comments.length > 1 ? "y" : ""
                            }`
                          : t("actions.comment")}
                      </span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {post.showComments && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      {/* Existing Comments */}
                      {post.comments.length > 0 && (
                        <div className="space-y-3 mb-4">
                          {post.comments.map((comment) => (
                            <div key={comment.id} className="flex space-x-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                                <span className="text-blue-600 dark:text-blue-400 font-semibold text-xs">
                                  {comment.author.name.charAt(0)}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                                      {comment.author.name}
                                    </h5>
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(
                                        comment.author.role
                                      )}`}
                                    >
                                      {getRoleIcon(comment.author.role)}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {formatTimestamp(comment.timestamp)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {comment.content}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-4 mt-2">
                                  <button
                                    onClick={() =>
                                      handleCommentLike(post.id, comment.id)
                                    }
                                    className={`flex items-center space-x-1 text-xs transition-colors ${
                                      comment.isLiked
                                        ? "text-red-500"
                                        : "text-gray-500 dark:text-gray-400 hover:text-red-500"
                                    }`}
                                  >
                                    <svg
                                      className="w-3 h-3"
                                      fill={
                                        comment.isLiked
                                          ? "currentColor"
                                          : "none"
                                      }
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                      />
                                    </svg>
                                    <span>{comment.likes}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Comment Form */}
                      <div className="flex space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 dark:text-blue-400 font-semibold text-xs">
                            U
                          </span>
                        </div>
                        <div className="flex-1">
                          <textarea
                            value={newComments[post.id] || ""}
                            onChange={(e) =>
                              setNewComments((prev) => ({
                                ...prev,
                                [post.id]: e.target.value,
                              }))
                            }
                            placeholder="Napisz komentarz..."
                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                            rows={2}
                          />
                          <div className="mt-2 flex justify-end">
                            <button
                              onClick={() => {
                                addComment(post.id, newComments[post.id] || "");
                                setNewComments((prev) => ({
                                  ...prev,
                                  [post.id]: "",
                                }));
                              }}
                              disabled={!newComments[post.id]?.trim()}
                              className="px-4 py-1.5 text-sm bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              Dodaj komentarz
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Online Users Sidebar */}
          <div className="w-80">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 sticky top-8">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t("onlineUsers.title")}
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({totalOnline})
                </span>
              </div>

              {isLoadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : usersError ? (
                <div className="text-center py-8">
                  <p className="text-red-500 text-sm">{usersError}</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {onlineUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                          {user.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {user.name}
                            </p>
                            <span
                              className={`px-1.5 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(
                                user.role
                              )}`}
                            >
                              {getRoleIcon(user.role)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {user.isOnline
                              ? t("onlineUsers.online")
                              : `${formatTimestamp(user.lastSeen)}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {recentlyActiveUsers.length > 0 && (
                    <>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        {t("onlineUsers.recentlyActive")}
                      </h4>
                      <div className="space-y-2">
                        {recentlyActiveUsers.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                              <span className="text-gray-600 dark:text-gray-400 font-semibold text-xs">
                                {user.name.charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                                {user.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTimestamp(user.lastSeen)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
