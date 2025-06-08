"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

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
}

interface OnlineUser {
  id: string;
  name: string;
  role: "user" | "trainer" | "nutritionist";
  lastActive: Date;
  isOnline: boolean;
}

export default function CommunityPage() {
  const t = useTranslations("community");
  const [newPost, setNewPost] = useState("");

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
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400";
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {" "}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{t("description")}</p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Create Post */}{" "}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t("createPost.title")}
            </h3>

            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder={t("createPost.placeholder")}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
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
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
              >
                {/* Post Header */}
                <div className="flex items-center space-x-3 mb-4">
                  {" "}
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
                    </div>{" "}
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
                  </button>
                  <button className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors">
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
                    </svg>
                    <span className="text-sm font-medium">
                      {t("actions.comment")}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
