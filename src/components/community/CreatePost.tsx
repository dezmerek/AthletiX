"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface CreatePostProps {
  onCreatePost: (
    content: string,
    type: "workout" | "nutrition" | "motivation" | "question" | "achievement"
  ) => void;
}

export default function CreatePost({ onCreatePost }: CreatePostProps) {
  const t = useTranslations("community");
  const [content, setContent] = useState("");
  const [selectedType, setSelectedType] = useState<
    "workout" | "nutrition" | "motivation" | "question" | "achievement"
  >("motivation");

  const handleSubmit = () => {
    if (!content.trim()) return;
    onCreatePost(content, selectedType);
    setContent("");
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
        {t("createPost.title")}
      </h3>

      {/* Post Type Selection */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {(
            [
              "motivation",
              "workout",
              "nutrition",
              "question",
              "achievement",
            ] as const
          ).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedType === type
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
              }`}
            >
              {t(`postTypes.${type}`)}
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t("createPost.placeholder")}
        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
        rows={3}
      />

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!content.trim()}
          className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {t("createPost.publish")}
        </button>
      </div>
    </div>
  );
}
