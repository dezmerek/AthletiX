"use client";

import { useState } from "react";

interface CommunityPostProps {
  id: string;
  author: {
    name: string;
    image?: string;
    role: "user" | "trainer" | "nutritionist";
  };
  content: string;
  timestamp: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
  tags: string[];
  type: "workout" | "nutrition" | "motivation" | "question" | "achievement";
  onLike: (id: string) => void;
}

export default function CommunityPost({
  id,
  author,
  content,
  timestamp,
  likes,
  comments,
  isLiked,
  tags,
  type,
  onLike,
}: CommunityPostProps) {
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
        return "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400";
      case "nutritionist":
        return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d`;
    }
  };

  const getPostTypeColor = (postType: string) => {
    switch (postType) {
      case "achievement":
        return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "workout":
        return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
      case "nutrition":
        return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
      case "question":
        return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
            {author.image ? (
              <img
                src={author.image}
                alt={author.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {author.name.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-slate-900 dark:text-white">
                {author.name}
              </h4>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                  author.role
                )}`}
              >
                {getRoleIcon(author.role)} {author.role}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {formatTimestamp(timestamp)}
            </p>
          </div>
        </div>

        <div
          className={`px-3 py-1 rounded-full text-xs font-medium ${getPostTypeColor(
            type
          )}`}
        >
          {type}
        </div>
      </div>

      {/* Post Content */}
      <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
        {content}
      </p>

      {/* Post Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => onLike(id)}
            className={`flex items-center space-x-2 transition-colors ${
              isLiked
                ? "text-red-500"
                : "text-slate-500 dark:text-slate-400 hover:text-red-500"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill={isLiked ? "currentColor" : "none"}
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
            <span className="text-sm font-medium">{likes}</span>
          </button>

          <button className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors">
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
            <span className="text-sm font-medium">{comments}</span>
          </button>

          <button className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 hover:text-green-500 transition-colors">
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
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
            </svg>
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}
