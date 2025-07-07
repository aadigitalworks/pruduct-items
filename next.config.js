const isProd = process.env.NODE_ENV === 'production';
const repoName = 'pruduct-items';  // <-- replace this with your actual GitHub repo name

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // enable static export
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  
  basePath: isProd ? `/${repoName}` : '',
  assetPrefix: isProd ? `/${repoName}/` : '',

  images: {
    unoptimized: true, // required for static export
  },

  // You can remove exportPathMap when using app dir
  // Dynamic routes should use generateStaticParams or getStaticPaths instead
};

module.exports = nextConfig;
