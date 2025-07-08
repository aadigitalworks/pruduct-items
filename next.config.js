const isProd = process.env.NODE_ENV === 'production';
const repoName = 'pruductitems';  // Your GitHub repo name

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // enables static HTML export
  trailingSlash: true, // ensures trailing slashes in URLs (important for GitHub Pages)
  distDir: 'out', // output directory for export

  // These are required for GitHub Pages static hosting
  basePath: isProd ? `/${repoName}` : '',
  assetPrefix: isProd ? `/${repoName}/` : '',

  images: {
    unoptimized: true, // required for static export
  },

  // You can optionally enable this if needed for debugging or path fixing
  // reactStrictMode: true,
};

module.exports = nextConfig;
