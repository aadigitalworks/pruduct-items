/** @type {import('next-sitemap').IConfig} */
const repo = 'pruductitems'; // Your repo name if using GitHub Pages

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  siteUrl: isProd ? `https://aadigitalworks.github.io/${repo}` : 'http://localhost:3000',
  generateRobotsTxt: true,
  outDir: './out', // This must match your export dir
  generateIndexSitemap: false,
  changefreq: 'weekly',
};
