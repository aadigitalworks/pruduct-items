const isProd = process.env.NODE_ENV === 'production';
const repoName = 'pruductitems';  

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

 
};

module.exports = nextConfig;
