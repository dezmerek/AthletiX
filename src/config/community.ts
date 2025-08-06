/**
 * Configuration for community features
 */

export const COMMUNITY_CONFIG = {
  // Posts configuration
  POSTS_PER_PAGE: 15,
  MAX_POST_LENGTH: 2000,
  MAX_COMMENT_LENGTH: 500,

  // Pagination configuration
  PAGINATION_TYPE: "loadMore" as "loadMore" | "pages",
  SHOW_PAGE_NUMBERS: true,
  MAX_VISIBLE_PAGE_NUMBERS: 5,

  // User activity configuration
  ONLINE_USERS_REFRESH_INTERVAL: 15000, // 15 seconds
  ACTIVITY_THRESHOLD_MINUTES: 5,

  // UI configuration
  SHOW_ONLINE_USERS: true,
  SHOW_RECENTLY_ACTIVE: true,

  // Auto-refresh intervals
  POSTS_AUTO_REFRESH: false,
  POSTS_REFRESH_INTERVAL: 30000, // 30 seconds
} as const;

export type CommunityConfig = typeof COMMUNITY_CONFIG;
