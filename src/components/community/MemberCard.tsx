"use client";

import { useTranslations } from "next-intl";

interface MemberCardProps {
  member: {
    id: string;
    name: string;
    image?: string;
    role: "user" | "trainer" | "nutritionist";
    specialization?: string;
    followers: number;
    isFollowing: boolean;
  };
  onFollow: (id: string) => void;
}

export default function MemberCard({ member, onFollow }: MemberCardProps) {
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
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
          {member.image ? (
            <img
              src={member.image}
              alt={member.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-lg">
              {member.name.charAt(0)}
            </span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {member.name}
            </h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                member.role
              )}`}
            >
              {getRoleIcon(member.role)} {t(`roles.${member.role}`)}
            </span>
          </div>
          {member.specialization && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              {member.specialization}
            </p>
          )}
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {member.followers} {t("members.followers")}
          </p>
        </div>
      </div>

      <button
        onClick={() => onFollow(member.id)}
        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
          member.isFollowing
            ? "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
            : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
        }`}
      >
        {member.isFollowing ? t("members.unfollow") : t("members.follow")}
      </button>
    </div>
  );
}
