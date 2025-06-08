"use client";

import { useTranslations } from "next-intl";

interface CommunityMember {
  id: string;
  name: string;
  image?: string;
  role: "user" | "trainer" | "nutritionist";
  specialization?: string;
  followers: number;
  isFollowing: boolean;
}

interface CommunitySidebarProps {
  professionals: CommunityMember[];
}

export default function CommunitySidebar({
  professionals,
}: CommunitySidebarProps) {
  const t = useTranslations("community");

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

  return (
    <div className="space-y-6">
      {/* Community Stats */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          {t("stats.title")}
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400">
              {t("stats.totalMembers")}
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              2,847
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400">
              {t("stats.activeToday")}
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              342
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400">
              {t("stats.postsToday")}
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              89
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400">
              {t("stats.trainers")}
            </span>
            <span className="font-semibold text-orange-600 dark:text-orange-400">
              56
            </span>
          </div>
        </div>
      </div>

      {/* Popular Topics */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          {t("topics.title")}
        </h3>

        <div className="space-y-3">
          {[
            { tag: "motywacja", count: 156 },
            { tag: "trening", count: 134 },
            { tag: "odżywianie", count: 98 },
            { tag: "bieganie", count: 87 },
            { tag: "siłownia", count: 76 },
          ].map((topic, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                #{topic.tag}
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-sm">
                {topic.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Professionals */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          {t("featured.title")}
        </h3>

        <div className="space-y-4">
          {professionals.slice(0, 2).map((professional) => (
            <div key={professional.id} className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                  {professional.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-slate-900 dark:text-white text-sm">
                  {professional.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {professional.specialization}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs ${getRoleBadgeColor(
                  professional.role
                )}`}
              >
                {getRoleIcon(professional.role)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
