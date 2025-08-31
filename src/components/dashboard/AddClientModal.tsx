"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role?: string | string[];
  createdAt: string;
}

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientAdded: (client: {
    _id: string;
    name: string;
    email: string;
    image?: string;
    type: string;
    status: string;
    addedAt: string | Date;
    notes?: string;
  }) => void;
}

export default function AddClientModal({
  isOpen,
  onClose,
  onClientAdded,
}: AddClientModalProps) {
  const t = useTranslations("clients");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [clientType, setClientType] = useState<
    "nutrition" | "training" | "both"
  >("both");
  const [notes, setNotes] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Wyszukiwanie użytkowników
  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError("");

    try {
      const response = await fetch(
        `/api/users/search?q=${encodeURIComponent(query)}&limit=10`
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
      } else {
        setError("Failed to search users");
      }
    } catch (error) {
      setError("Error searching users");
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        searchUsers(searchQuery);
      }, 300);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Dodawanie klienta
  const addClient = async () => {
    if (!selectedUser) return;

    setIsAdding(true);
    setError("");

    try {
      const response = await fetch("/api/professional/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: selectedUser._id,
          type: clientType,
          notes: notes.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("API Response:", data);
        console.log("Client data:", data.client);
        onClientAdded(data.client);
        onClose();
        resetForm();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to add client");
      }
    } catch (error) {
      setError("Error adding client");
    } finally {
      setIsAdding(false);
    }
  };

  const resetForm = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedUser(null);
    setClientType("both");
    setNotes("");
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {t("addClientModal.title")}
          </h2>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Search Section */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t("addClientModal.searchLabel")}
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("addClientModal.searchPlaceholder")}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              {isSearching && (
                <div className="absolute right-3 top-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500"></div>
                </div>
              )}
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t("addClientModal.searchResults")}
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => setSelectedUser(user)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedUser?._id === user._id
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                        : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name || "User"}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <span className="text-slate-600 dark:text-slate-400 font-medium">
                            {(user.name || user.email).charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {user.name || t("addClientModal.noName")}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Client Type Selection */}
          {selectedUser && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t("addClientModal.clientType")}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(["nutrition", "training", "both"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setClientType(type)}
                    className={`p-3 border rounded-lg transition-colors ${
                      clientType === type
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                        : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-sm font-medium">
                        {t(`types.${type}`)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {selectedUser && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t("addClientModal.notes")}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("addClientModal.notesPlaceholder")}
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {t("addClientModal.cancel")}
          </button>
          <button
            onClick={addClient}
            disabled={!selectedUser || isAdding}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white rounded-lg transition-colors font-medium disabled:cursor-not-allowed"
          >
            {isAdding ? t("addClientModal.adding") : t("addClientModal.add")}
          </button>
        </div>
      </div>
    </div>
  );
}
