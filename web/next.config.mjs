// @ts-check
import configureBundleAnalyzer from "@next/bundle-analyzer";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  optimizeFonts: true,
  images: {
    domains: ["firebasestorage.googleapis.com", "localhost", "lh3.googleusercontent.com", "via.placeholder.com", "source.unsplash.com"],
  },
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
};

const withBundleAnalyzer = configureBundleAnalyzer({ enabled: process.env.ANALYZE_BUNDLE === "true" });

export default withBundleAnalyzer(nextConfig);
