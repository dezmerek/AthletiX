"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  type: "text" | "image" | "file";
}

interface Conversation {
  id: string;
  // Dla profesjonalistów - informacje o kliencie
  clientId?: string;
  clientName?: string;
  clientEmail?: string;
  clientAvatar?: string;
  // Dla użytkowników - informacje o profesjonaliście
  professionalId?: string;
  professionalName?: string;
  professionalEmail?: string;
  professionalAvatar?: string;
  professionalRole?: "trainer" | "dietitian" | "both";
  // Wspólne pola
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: "active" | "archived" | "pending";
  type: "nutrition" | "training" | "both";
}

interface Professional {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "trainer" | "dietitian" | "both";
  specialization: string;
  status: "active" | "inactive";
}

interface Client {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  type: "nutrition" | "training" | "both";
  status: "active" | "inactive";
}

export default function MessagingPage() {
  const t = useTranslations("messaging");
  const { data: session } = useSession();
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "archived" | "pending"
  >("all");
  const [filterType, setFilterType] = useState<
    "all" | "nutrition" | "training" | "both"
  >("all");
  const [newMessage, setNewMessage] = useState("");
  const [showNewConversationModal, setShowNewConversationModal] =
    useState(false);

  // Określamy kontekst użytkownika
  const isProfessional = session?.user?.activeContext === "professional";
  const isUser = session?.user?.activeContext === "user";

  // Mock data - w prawdziwej aplikacji to będzie z API
  const [conversations] = useState<Conversation[]>([
    // Dla profesjonalistów - konwersacje z klientami
    ...(isProfessional
      ? [
          {
            id: "1",
            clientId: "client1",
            clientName: "Anna Kowalska",
            clientEmail: "anna.kowalska@email.com",
            lastMessage:
              "Dziękuję za plan treningowy! Czy mogę dodać więcej ćwiczeń cardio?",
            lastMessageTime: "2024-01-15T14:30:00",
            unreadCount: 2,
            status: "active",
            type: "both",
          },
          {
            id: "2",
            clientId: "client2",
            clientName: "Piotr Nowak",
            clientEmail: "piotr.nowak@email.com",
            lastMessage: "Waga spadła o 2kg w tym tygodniu!",
            lastMessageTime: "2024-01-15T12:15:00",
            unreadCount: 0,
            status: "active",
            type: "training",
          },
          {
            id: "3",
            clientId: "client3",
            clientName: "Maria Wiśniewska",
            clientEmail: "maria.wisniewska@email.com",
            lastMessage: "Czy mogę zjeść owoce wieczorem?",
            lastMessageTime: "2024-01-15T10:45:00",
            unreadCount: 1,
            status: "active",
            type: "nutrition",
          },
        ]
      : []),
    // Dla użytkowników - konwersacje z profesjonalistami
    ...(isUser
      ? [
          {
            id: "1",
            professionalId: "trainer1",
            professionalName: "Marek Kowalczyk",
            professionalEmail: "marek.kowalczyk@athletix.com",
            professionalRole: "trainer",
            lastMessage:
              "Świetnie wykonujesz ćwiczenia! Pamiętaj o rozciąganiu po treningu.",
            lastMessageTime: "2024-01-15T14:30:00",
            unreadCount: 1,
            status: "active",
            type: "training",
          },
          {
            id: "2",
            professionalId: "dietitian1",
            professionalName: "Anna Nowak",
            professionalEmail: "anna.nowak@athletix.com",
            professionalRole: "dietitian",
            lastMessage:
              "Twój dziennik żywieniowy wygląda dobrze. Dodaj więcej warzyw!",
            lastMessageTime: "2024-01-15T12:15:00",
            unreadCount: 0,
            status: "active",
            type: "nutrition",
          },
          {
            id: "3",
            professionalId: "both1",
            professionalName: "Piotr Wiśniewski",
            professionalEmail: "piotr.wisniewski@athletix.com",
            professionalRole: "both",
            lastMessage:
              "Widzę postępy w treningu i diecie. Kontynuuj tak dalej!",
            lastMessageTime: "2024-01-15T10:45:00",
            unreadCount: 2,
            status: "active",
            type: "both",
          },
        ]
      : []),
  ]);

  const [messages] = useState<Message[]>([
    {
      id: "1",
      senderId: isProfessional ? "client1" : "trainer1",
      receiverId: isProfessional ? "professional" : "user",
      content: isProfessional
        ? "Dziękuję za plan treningowy! Czy mogę dodać więcej ćwiczeń cardio?"
        : "Świetnie wykonujesz ćwiczenia! Pamiętaj o rozciąganiu po treningu.",
      timestamp: "2024-01-15T14:30:00",
      isRead: false,
      type: "text",
    },
    {
      id: "2",
      senderId: isProfessional ? "professional" : "user",
      receiverId: isProfessional ? "client1" : "trainer1",
      content: isProfessional
        ? "Oczywiście! Dodaję 20 minut cardio na koniec każdego treningu. Jak Ci się podoba?"
        : "Dziękuję! Czy mogę dodać więcej ćwiczeń cardio?",
      timestamp: "2024-01-15T14:35:00",
      isRead: true,
      type: "text",
    },
    {
      id: "3",
      senderId: isProfessional ? "client1" : "trainer1",
      receiverId: isProfessional ? "professional" : "user",
      content: isProfessional
        ? "Świetnie! Będę ćwiczyć codziennie rano."
        : "Oczywiście! Dodaję 20 minut cardio na koniec każdego treningu.",
      timestamp: "2024-01-15T14:40:00",
      isRead: false,
      type: "text",
    },
  ]);

  const filteredConversations = conversations.filter((conversation) => {
    const searchName = isProfessional
      ? conversation.clientName
      : conversation.professionalName;
    const searchEmail = isProfessional
      ? conversation.clientEmail
      : conversation.professionalEmail;

    const matchesSearch =
      searchName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      searchEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || conversation.status === filterStatus;
    const matchesType =
      filterType === "all" || conversation.type === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const selectedConv = conversations.find((c) => c.id === selectedConversation);
  const conversationMessages = messages.filter((m) => {
    if (isProfessional) {
      return (
        (m.senderId === selectedConv?.clientId &&
          m.receiverId === "professional") ||
        (m.senderId === "professional" &&
          m.receiverId === selectedConv?.clientId)
      );
    } else {
      return (
        (m.senderId === selectedConv?.professionalId &&
          m.receiverId === "user") ||
        (m.senderId === "user" && m.receiverId === selectedConv?.professionalId)
      );
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "archived":
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "nutrition":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "training":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "both":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "trainer":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "dietitian":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "both":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400";
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      // W prawdziwej aplikacji tutaj byłoby wysłanie wiadomości do API
      console.log("Wysyłanie wiadomości:", newMessage);
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
      return "Wczoraj";
    } else {
      return date.toLocaleDateString("pl-PL");
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "trainer":
        return t("roles.trainer");
      case "dietitian":
        return t("roles.dietitian");
      case "both":
        return t("roles.both");
      default:
        return role;
    }
  };

  // Funkcje pomocnicze do wyświetlania informacji
  const getConversationName = (conversation: Conversation) => {
    return isProfessional
      ? conversation.clientName
      : conversation.professionalName;
  };

  const getConversationEmail = (conversation: Conversation) => {
    return isProfessional
      ? conversation.clientEmail
      : conversation.professionalEmail;
  };

  const getConversationAvatar = (conversation: Conversation) => {
    return isProfessional
      ? conversation.clientAvatar
      : conversation.professionalAvatar;
  };

  const getConversationRole = (conversation: Conversation) => {
    return conversation.professionalRole;
  };

  const isMessageFromCurrentUser = (message: Message) => {
    if (isProfessional) {
      return message.senderId === "professional";
    } else {
      return message.senderId === "user";
    }
  };

  const getCurrentUserId = () => {
    return isProfessional ? "professional" : "user";
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 flex">
        {/* Sidebar z konwersacjami */}
        <div className="w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                {t("title")}
              </h2>
              <button
                onClick={() => setShowNewConversationModal(true)}
                className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                title={t("newConversation")}
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white text-sm"
            />
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex space-x-2 mb-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="flex-1 px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
              >
                <option value="all">{t("filters.allStatuses")}</option>
                <option value="active">{t("filters.active")}</option>
                <option value="archived">{t("filters.archived")}</option>
                <option value="pending">{t("filters.pending")}</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="flex-1 px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
              >
                <option value="all">{t("filters.allTypes")}</option>
                <option value="nutrition">{t("filters.nutrition")}</option>
                <option value="training">{t("filters.training")}</option>
                <option value="both">{t("filters.both")}</option>
              </select>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`p-4 border-b border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                  selectedConversation === conversation.id
                    ? "bg-slate-100 dark:bg-slate-700/50"
                    : ""
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center flex-shrink-0">
                    {getConversationAvatar(conversation) ? (
                      <img
                        src={getConversationAvatar(conversation)}
                        alt={getConversationName(conversation)}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <span className="text-slate-600 dark:text-slate-400 font-medium">
                        {getConversationName(conversation)
                          ?.charAt(0)
                          .toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {getConversationName(conversation)}
                      </h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatTime(conversation.lastMessageTime)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 truncate mb-2">
                      {conversation.lastMessage}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-1">
                        {/* Dla użytkowników pokazujemy rolę profesjonalisty */}
                        {!isProfessional &&
                          getConversationRole(conversation) && (
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(
                                getConversationRole(conversation)!
                              )}`}
                            >
                              {getRoleLabel(getConversationRole(conversation)!)}
                            </span>
                          )}
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(
                            conversation.type
                          )}`}
                        >
                          {t(`types.${conversation.type}`)}
                        </span>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            conversation.status
                          )}`}
                        >
                          {t(`statuses.${conversation.status}`)}
                        </span>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Główny obszar czatu */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-800">
          {selectedConversation ? (
            <>
              {/* Header czatu */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                    {getConversationAvatar(selectedConv!) ? (
                      <img
                        src={getConversationAvatar(selectedConv!)}
                        alt={getConversationName(selectedConv!)}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <span className="text-slate-600 dark:text-slate-400 font-medium">
                        {getConversationName(selectedConv!)
                          ?.charAt(0)
                          .toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">
                      {getConversationName(selectedConv!)}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {getConversationEmail(selectedConv!)}
                    </p>
                  </div>
                  <div className="ml-auto flex space-x-2">
                    {/* Dla użytkowników pokazujemy rolę profesjonalisty */}
                    {!isProfessional && getConversationRole(selectedConv!) && (
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(
                          getConversationRole(selectedConv!)!
                        )}`}
                      >
                        {getRoleLabel(getConversationRole(selectedConv!)!)}
                      </span>
                    )}
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(
                        selectedConv?.type || "both"
                      )}`}
                    >
                      {t(`types.${selectedConv?.type || "both"}`)}
                    </span>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        selectedConv?.status || "active"
                      )}`}
                    >
                      {t(`statuses.${selectedConv?.status || "active"}`)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Wiadomości */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {conversationMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      isMessageFromCurrentUser(message)
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isMessageFromCurrentUser(message)
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isMessageFromCurrentUser(message)
                            ? "text-emerald-100"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input wiadomości */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder={t("messagePlaceholder")}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white rounded-lg transition-colors"
                  >
                    {t("send")}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Placeholder gdy nie wybrano konwersacji */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-slate-400"
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
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  {t("noConversation.title")}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  {t("noConversation.description")}
                </p>
                <button
                  onClick={() => setShowNewConversationModal(true)}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
                >
                  {t("noConversation.startChat")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
