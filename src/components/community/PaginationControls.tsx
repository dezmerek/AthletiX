"use client";

import { Pagination } from "./Pagination";
import { COMMUNITY_CONFIG } from "@/config/community";
import { useTranslations } from "next-intl";

interface PaginationControlsProps {
  // Data
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  hasMore: boolean;
  loading: boolean;

  // Navigation functions
  onPageChange: (page: number) => void;
  onLoadMore: () => void;

  // Configuration
  paginationType?: "loadMore" | "pages";
  postsPerPage?: number;
  showPostCount?: boolean;
  className?: string;
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalPosts,
  hasMore,
  loading,
  onPageChange,
  onLoadMore,
  paginationType = COMMUNITY_CONFIG.PAGINATION_TYPE,
  postsPerPage = COMMUNITY_CONFIG.POSTS_PER_PAGE,
  showPostCount = true,
  className = "",
}: PaginationControlsProps) {
  const t = useTranslations("community.pagination");

  const showLoadMore = paginationType === "loadMore";
  const showPages = paginationType === "pages";

  const startPost = (currentPage - 1) * postsPerPage + 1;
  const endPost = Math.min(currentPage * postsPerPage, totalPosts);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Post count info */}
      {showPostCount && totalPosts > 0 && (
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("showingPosts", {
              start: startPost,
              end: endPost,
              total: totalPosts,
            })}
          </p>
        </div>
      )}

      {/* Load More Button */}
      {showLoadMore && hasMore && (
        <div className="text-center">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>{t("loading")}</span>
              </div>
            ) : (
              t("loadMore")
            )}
          </button>
        </div>
      )}

      {/* Page Navigation */}
      {showPages && totalPages > 1 && (
        <div className="flex justify-center">
          {/* Page numbers */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            loading={loading}
            maxVisiblePages={COMMUNITY_CONFIG.MAX_VISIBLE_PAGE_NUMBERS}
          />
        </div>
      )}

      {/* No more posts message */}
      {!hasMore && totalPosts > 0 && paginationType === "loadMore" && (
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("allPostsShown")}
          </p>
        </div>
      )}
    </div>
  );
}
