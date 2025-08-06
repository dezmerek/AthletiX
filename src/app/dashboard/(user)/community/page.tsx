"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useOnlineUsers } from "@/hooks/useOnlineUsers";
import { useCommunityPosts } from "@/hooks/useCommunityPosts";
import { COMMUNITY_CONFIG } from "@/config/community";
import { PaginationControls } from "@/components/community/PaginationControls";
import { PaginationSettings } from "@/components/community/PaginationSettings";

export default function CommunityPage() {
  const t = useTranslations("community");
  const tTime = useTranslations("community.time");
  const [newPost, setNewPost] = useState("");
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [paginationType, setPaginationType] = useState<"loadMore" | "pages">(
    COMMUNITY_CONFIG.PAGINATION_TYPE
  );

  // Community posts data
  const {
    posts,
    loading: postsLoading,
    error: postsError,
    createPost,
    likePost,
    likeComment,
    addComment: addCommentAPI,
    hasMore,
    currentPage,
    totalPages,
    totalPosts,
    loadMore,
    goToPage,
    nextPage,
    prevPage,
    setPostExpanded,
    clearNewCommentsFlag, // Add this new function
  } = useCommunityPosts({
    postsPerPage: COMMUNITY_CONFIG.POSTS_PER_PAGE,
    paginationType: paginationType,
  });

  // Online users data
  const {
    onlineUsers,
    recentlyActiveUsers,
    totalOnline,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useOnlineUsers({
    enabled: true,
    refreshInterval: COMMUNITY_CONFIG.ONLINE_USERS_REFRESH_INTERVAL,
  });

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    const success = await createPost(newPost);
    if (success) {
      setNewPost("");
    }
  };

  const handleLike = async (postId: string) => {
    await likePost(postId);
  };

  const handleCommentLike = async (postId: string, commentId: string) => {
    await likeComment(postId, commentId);
  };

  const toggleComments = (postId: string) => {
    const isCurrentlyShown = showComments[postId];
    const newState = !isCurrentlyShown;

    setShowComments((prev) => ({
      ...prev,
      [postId]: newState,
    }));

    // Notify the hook about expanded state for real-time comment updates
    setPostExpanded(postId, newState);

    // Clear the new comments flag when user opens comments
    if (newState) {
      clearNewCommentsFlag(postId);
    }
  };

  const handleAddComment = async (postId: string, content: string) => {
    if (!content.trim()) return;

    await addCommentAPI(postId, content);
    setNewComments((prev) => ({
      ...prev,
      [postId]: "",
    }));
  };

  const getRoleIcon = (role: string | string[]) => {
    const roles = Array.isArray(role) ? role : [role];

    // Priorytet: admin > professional > user
    if (roles.includes("admin")) return "👑";
    if (roles.includes("professional")) return "💼";
    return "👤";
  };

  const getRoleBadgeColor = (role: string | string[]) => {
    const roles = Array.isArray(role) ? role : [role];

    // Priorytet: admin > professional > user
    if (roles.includes("admin")) {
      return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
    }
    if (roles.includes("professional")) {
      return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
    }
    return "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400";
  };

  const getRoleDisplayText = (
    role: string | string[],
    isPremiumPersonal?: boolean,
    isPremiumProfessional?: boolean
  ) => {
    const roles = Array.isArray(role) ? role : [role];

    // Priorytet: admin > professional > user
    let mainRole = "user";
    if (roles.includes("admin")) {
      mainRole = "admin";
    } else if (roles.includes("professional")) {
      mainRole = "professional";
    }

    let displayText = t(`roles.${mainRole}`);

    // Dodaj premium status dla głównej roli
    if (mainRole === "user" && isPremiumPersonal) {
      displayText += " PRO";
    } else if (mainRole === "professional" && isPremiumProfessional) {
      displayText += " PRO";
    }

    return displayText;
  };

  const getAllRoles = (
    role: string | string[],
    isPremiumPersonal?: boolean,
    isPremiumProfessional?: boolean
  ) => {
    const roles = Array.isArray(role) ? role : [role];
    const roleTexts: string[] = [];

    roles.forEach((r) => {
      let roleText = t(`roles.${r}`);

      // Dodaj premium status
      if (r === "user" && isPremiumPersonal) {
        roleText += " PRO";
      } else if (r === "professional" && isPremiumProfessional) {
        roleText += " PRO";
      }

      roleTexts.push(roleText);
    });

    return roleTexts.join(", ");
  };

  const hasMultipleRoles = (role: string | string[]) => {
    const roles = Array.isArray(role) ? role : [role];
    return roles.length > 1;
  };

  const formatTimestamp = (dateString: string | Date) => {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return tTime("minutesAgo", { minutes: diffInMinutes });
    } else if (diffInMinutes < 1440) {
      return tTime("hoursAgo", { hours: Math.floor(diffInMinutes / 60) });
    } else {
      return tTime("daysAgo", { days: Math.floor(diffInMinutes / 1440) });
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

            {/* Posts Feed Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("feed.title")}
              </h2>
              <PaginationSettings
                currentType={paginationType}
                onTypeChange={setPaginationType}
              />
            </div>

            {/* Posts Feed */}
            <div className="space-y-6">
              {postsLoading && posts.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : postsError ? (
                <div className="text-center py-8">
                  <p className="text-red-500 text-sm">{postsError}</p>
                </div>
              ) : (
                <>
                  {posts.map((post) => (
                    <div
                      key={post._id}
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
                              className={`px-2 py-1 rounded-full text-xs font-medium relative group cursor-help ${getRoleBadgeColor(
                                post.author.role
                              )}`}
                              title={
                                hasMultipleRoles(post.author.role)
                                  ? getAllRoles(
                                      post.author.role,
                                      post.author.isPremiumPersonal,
                                      post.author.isPremiumProfessional
                                    )
                                  : undefined
                              }
                            >
                              {getRoleIcon(post.author.role)}{" "}
                              {getRoleDisplayText(
                                post.author.role,
                                post.author.isPremiumPersonal,
                                post.author.isPremiumProfessional
                              )}
                              {hasMultipleRoles(post.author.role) && (
                                <span className="ml-1 text-xs opacity-75">
                                  +
                                </span>
                              )}
                              {/* Tooltip dla wielokrotnych ról */}
                              {hasMultipleRoles(post.author.role) && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                  {getAllRoles(
                                    post.author.role,
                                    post.author.isPremiumPersonal,
                                    post.author.isPremiumProfessional
                                  )}
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                                </div>
                              )}
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
                          onClick={() => handleLike(post._id)}
                          className={`flex items-center space-x-2 transition-colors ${
                            post.isLikedByUser
                              ? "text-red-500"
                              : "text-gray-500 dark:text-gray-400 hover:text-red-500"
                          }`}
                        >
                          <svg
                            className="w-5 h-5"
                            fill={post.isLikedByUser ? "currentColor" : "none"}
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
                          <span className="text-sm font-medium">
                            {post.likeCount}
                          </span>
                        </button>
                        <button
                          onClick={() => toggleComments(post._id)}
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
                          </svg>
                          <span className="text-sm font-medium">
                            {post.commentCount > 0
                              ? `${post.commentCount} ${t("actions.comment")}${
                                  post.commentCount > 1 ? "y" : ""
                                }`
                              : t("actions.comment")}
                          </span>
                          {post.hasNewComments && !showComments[post._id] && (
                            <span className="inline-flex items-center justify-center w-2 h-2 bg-blue-500 rounded-full animate-pulse">
                              <span className="sr-only">Nowe komentarze</span>
                            </span>
                          )}
                        </button>
                      </div>

                      {/* Comments Section */}
                      {showComments[post._id] && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          {/* Existing Comments */}
                          {post.comments.length > 0 && (
                            <div className="space-y-3 mb-4">
                              {post.comments.map((comment) => (
                                <div
                                  key={comment.id}
                                  className="flex space-x-3"
                                >
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
                                          className={`px-1.5 py-0.5 rounded text-xs font-medium relative group cursor-help ${getRoleBadgeColor(
                                            comment.author.role
                                          )}`}
                                          title={
                                            hasMultipleRoles(
                                              comment.author.role
                                            )
                                              ? getAllRoles(
                                                  comment.author.role,
                                                  comment.author
                                                    .isPremiumPersonal,
                                                  comment.author
                                                    .isPremiumProfessional
                                                )
                                              : undefined
                                          }
                                        >
                                          {getRoleIcon(comment.author.role)}
                                          {hasMultipleRoles(
                                            comment.author.role
                                          ) && (
                                            <span className="ml-0.5 text-xs opacity-75">
                                              +
                                            </span>
                                          )}

                                          {/* Tooltip dla wielokrotnych ról */}
                                          {hasMultipleRoles(
                                            comment.author.role
                                          ) && (
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                              {getAllRoles(
                                                comment.author.role,
                                                comment.author
                                                  .isPremiumPersonal,
                                                comment.author
                                                  .isPremiumProfessional
                                              )}
                                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                                            </div>
                                          )}
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
                                          handleCommentLike(
                                            post._id,
                                            comment.id
                                          )
                                        }
                                        className={`flex items-center space-x-1 text-xs transition-colors ${
                                          comment.isLikedByUser
                                            ? "text-red-500"
                                            : "text-gray-500 dark:text-gray-400 hover:text-red-500"
                                        }`}
                                      >
                                        <svg
                                          className="w-3 h-3"
                                          fill={
                                            comment.isLikedByUser
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
                                value={newComments[post._id] || ""}
                                onChange={(e) =>
                                  setNewComments((prev) => ({
                                    ...prev,
                                    [post._id]: e.target.value,
                                  }))
                                }
                                placeholder={t("feed.commentPlaceholder")}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                rows={2}
                              />
                              <div className="mt-2 flex justify-end">
                                <button
                                  onClick={() => {
                                    handleAddComment(
                                      post._id,
                                      newComments[post._id] || ""
                                    );
                                  }}
                                  disabled={!newComments[post._id]?.trim()}
                                  className="px-4 py-1.5 text-sm bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  {t("feed.addComment")}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Pagination Controls */}
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalPosts={totalPosts}
                    hasMore={hasMore}
                    loading={postsLoading}
                    onPageChange={goToPage}
                    onLoadMore={loadMore}
                    paginationType={paginationType}
                    postsPerPage={COMMUNITY_CONFIG.POSTS_PER_PAGE}
                    showPostCount={true}
                  />
                </>
              )}
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
                              className={`px-1.5 py-0.5 rounded text-xs font-medium relative group cursor-help ${getRoleBadgeColor(
                                user.role
                              )}`}
                              title={
                                hasMultipleRoles(user.role)
                                  ? getAllRoles(
                                      user.role,
                                      user.isPremiumPersonal,
                                      user.isPremiumProfessional
                                    )
                                  : undefined
                              }
                            >
                              {getRoleIcon(user.role)}
                              {hasMultipleRoles(user.role) && (
                                <span className="ml-0.5 text-xs opacity-75">
                                  +
                                </span>
                              )}

                              {/* Tooltip dla wielokrotnych ról */}
                              {hasMultipleRoles(user.role) && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                  {getAllRoles(
                                    user.role,
                                    user.isPremiumPersonal,
                                    user.isPremiumProfessional
                                  )}
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                                </div>
                              )}
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
