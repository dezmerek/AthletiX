import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin();

const config: NextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com"], // Zezwól na obrazy z Google
  },
};

export default withNextIntl(config);
