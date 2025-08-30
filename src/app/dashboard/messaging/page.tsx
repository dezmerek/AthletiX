"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useMessaging, User, Conversation } from "@/hooks/useMessaging";
import MessageNotification from "@/components/messaging/MessageNotification";

export default function MessagingPage() {
  const { data: session } = useSession();
  const t = useTranslations("messaging");
  const {
    searchResults,
    conversations,
    messages,
    loading,
    error,
    searchUsers,
    getConversations,
    getMessages,
    sendMessage,
    clearError,
    removeNotification,
    currentUser,
    isConnected,
    notifications,
  } = useMessaging();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (session?.user) {
      getConversations();
    }
  }, [session, getConversations]);

  useEffect(() => {
    if (searchQuery) {
      const timeoutId = setTimeout(() => {
        searchUsers(searchQuery);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      // Clear search results
    }
  }, [searchQuery, searchUsers]);

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setSelectedConversation(null);
    getMessages(user.email);
    setShowSearch(false);
    setSearchQuery("");
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setSelectedUser({
      name: conversation.userName,
      email: conversation.userEmail,
    });
    getMessages(conversation.userEmail);
    setShowSearch(false);
  };

  const handleSendMessage = async () => {
    if (!selectedUser || !newMessage.trim()) return;

    const success = await sendMessage(selectedUser.email, newMessage);
    if (success) {
      setNewMessage("");
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "wczoraj";
    } else {
      return date.toLocaleDateString("pl-PL", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  if (!session?.user) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                {t("title")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                {t("description")}
              </p>
            </div>
            {/* Real-time connection indicator */}
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span
                className={`text-sm ${
                  isConnected
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {isConnected ? "Połączony" : "Rozłączony"}
              </span>
            </div>
          </div>
        </div>

        {/* Messaging Interface */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="flex h-[calc(100vh-12rem)]">
            {/* Sidebar */}
            <div className="w-80 border-r border-slate-200 dark:border-slate-700 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-2"
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
                  {t("newMessage")}
                </button>
              </div>

              {/* Search */}
              {showSearch && (
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <input
                      type="text"
                      placeholder={t("searchPlaceholder")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  {searchResults.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {searchResults.map((user) => (
                        <button
                          key={user.email}
                          onClick={() => handleUserSelect(user)}
                          className="w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <div className="flex items-center">
                            <svg
                              className="w-8 h-8 bg-slate-200 dark:bg-slate-600 rounded-full p-1 mr-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">
                                {user.name || user.email}
                              </div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                    {t("noConversations")}
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <button
                      key={conversation.userEmail}
                      onClick={() => handleConversationSelect(conversation)}
                      className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700 ${
                        selectedConversation?.userEmail ===
                        conversation.userEmail
                          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <svg
                            className="w-10 h-10 bg-slate-200 dark:bg-slate-600 rounded-full p-2 mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              {conversation.userName || conversation.userEmail}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-48">
                              {conversation.lastMessage.content}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {formatTime(conversation.lastMessage.timestamp)}
                          </div>
                          {conversation.unreadCount > 0 && (
                            <div className="mt-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                              {conversation.unreadCount}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedUser ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center">
                      <svg
                        className="w-10 h-10 bg-slate-200 dark:bg-slate-600 rounded-full p-2 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">
                          {selectedUser.name || selectedUser.email}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {selectedUser.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-slate-500 dark:text-slate-400 mt-8">
                        {t("noMessages")}
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message._id}
                          className={`flex ${
                            message.senderId === currentUser?.email
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.senderId === currentUser?.email
                                ? "bg-blue-600 text-white"
                                : "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white"
                            }`}
                          >
                            <div className="text-sm">{message.content}</div>
                            <div
                              className={`text-xs mt-1 ${
                                message.senderId === currentUser?.email
                                  ? "text-blue-100"
                                  : "text-slate-500 dark:text-slate-400"
                              }`}
                            >
                              {formatTime(message.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleSendMessage()
                        }
                        placeholder={t("messagePlaceholder")}
                        className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || loading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg transition-colors flex items-center"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-slate-500 dark:text-slate-400">
                    <svg
                      className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600"
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
                    <h3 className="text-lg font-medium mb-2">
                      {t("selectConversation")}
                    </h3>
                    <p>{t("selectConversationDesc")}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Toast */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={clearError}
                className="ml-4 text-white hover:text-red-200"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Message Notifications */}
        {notifications.map((notification) => (
          <MessageNotification
            key={notification.id}
            message={notification.message}
            senderName={notification.senderName}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </div>
  );
}
