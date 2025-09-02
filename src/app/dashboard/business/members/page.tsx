"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import AddMemberModal from "@/components/dashboard/business/AddMemberModal";

interface Member {
  id: string;
  memberId: string;
  name: string;
  email: string;
  role: "owner" | "member" | "staff" | "admin";
  status: "active" | "inactive" | "pending";
  joinDate: string;
  lastActive: string;
  subscription: "owner" | "free" | "pro";
  workouts: number;
  nutritionLogs: number;
  totalWorkoutTime: number;
}

export default function BusinessMembersPage() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Member["status"] | "all">(
    "all"
  );
  const [roleFilter, setRoleFilter] = useState<Member["role"] | "all">("all");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/business/members`);

      if (response.ok) {
        const data = await response.json();
        setMembers(data.members || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch members");
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      setError("Failed to fetch members");
    } finally {
      setLoading(false);
    }
  };

  // Pobierz członków firmy
  useEffect(() => {
    if (session?.user) {
      fetchMembers();
    }
  }, [session]);

  const handleAddMemberSuccess = () => {
    fetchMembers(); // Odśwież listę członków
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || member.status === statusFilter;
    const matchesRole = roleFilter === "all" || member.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return "Brak danych";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("pl-PL");
    } catch {
      return "Brak danych";
    }
  };

  const formatLastActive = (dateString: string) => {
    if (!dateString) return "Nigdy";

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      if (diffInMinutes < 60) {
        return `${diffInMinutes} min temu`;
      } else if (diffInHours < 24) {
        return `${diffInHours} godziny temu`;
      } else if (diffInDays < 7) {
        return `${diffInDays} dni temu`;
      } else {
        return formatDate(dateString);
      }
    } catch {
      return "Brak danych";
    }
  };

  const formatWorkoutTime = (minutes: number) => {
    if (!minutes || minutes === 0) return "0 min";

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}min`;
    }
    return `${remainingMinutes} min`;
  };

  const getStatusBadge = (status: Member["status"]) => {
    const styles = {
      active:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      inactive: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    };

    const labels = {
      active: "Aktywny",
      inactive: "Nieaktywny",
      pending: "Oczekujący",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  const getRoleBadge = (role: Member["role"]) => {
    const styles = {
      owner:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      member:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      staff:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      admin:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    };

    const labels = {
      owner: "Właściciel",
      member: "Członek",
      staff: "Pracownik",
      admin: "Administrator",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${styles[role]}`}
      >
        {labels[role]}
      </span>
    );
  };

  const getSubscriptionBadge = (subscription: Member["subscription"]) => {
    const styles = {
      owner: "bg-gradient-to-r from-yellow-500 to-orange-600 text-white",
      free: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300",
      pro: "bg-gradient-to-r from-blue-500 to-purple-600 text-white",
    };

    const labels = {
      owner: "Właściciel",
      free: "Free",
      pro: "Pro",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${styles[subscription]}`}
      >
        {labels[subscription]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            Ładowanie członków...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 py-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            Błąd ładowania
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Spróbuj ponownie
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 py-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Zarządzanie zespołem
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Zarządzaj członkami, pracownikami i uprawnieniami
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={fetchMembers}
              className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Odśwież</span>
            </button>
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Dodaj członka</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Wszyscy członkowie
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {members.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Aktywni
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {members.filter((m) => m.status === "active").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-600 dark:text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Pracownicy
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {
                  members.filter(
                    (m) => m.role === "staff" || m.role === "admin"
                  ).length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-orange-600 dark:text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Plan Pro
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {members.filter((m) => m.subscription === "pro").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Szukaj po nazwie lub emailu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as Member["status"] | "all")
              }
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            >
              <option value="all">Wszystkie statusy</option>
              <option value="active">Aktywni</option>
              <option value="inactive">Nieaktywni</option>
              <option value="pending">Oczekujący</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) =>
                setRoleFilter(e.target.value as Member["role"] | "all")
              }
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            >
              <option value="all">Wszystkie role</option>
              <option value="member">Członkowie</option>
              <option value="staff">Pracownicy</option>
              <option value="admin">Administratorzy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Członek
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Rola
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Aktywność
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Dołączył
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredMembers.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {member.name}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {member.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(member.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(member.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getSubscriptionBadge(member.subscription)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900 dark:text-white">
                      <div>Treningi: {member.workouts}</div>
                      <div>Żywienie: {member.nutritionLogs}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Czas: {formatWorkoutTime(member.totalWorkoutTime)}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Ostatnio: {formatLastActive(member.lastActive)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {formatDate(member.joinDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                        Edytuj
                      </button>
                      <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                        Usuń
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <MagnifyingGlassIcon className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            Nie znaleziono członków
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Spróbuj zmienić filtry lub dodać nowego członka.
          </p>
        </div>
      )}

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        onSuccess={handleAddMemberSuccess}
      />
    </div>
  );
}
