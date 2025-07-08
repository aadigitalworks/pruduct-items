const isProd = process.env.NODE_ENV === 'production';
const repo = 'pruductitems';

if (!isProd) {
  console.log('Skipping sitemap generation for local environment');
  // Optional: export empty config or exit early
  module.exports = {};
  return;
}

module.exports = {
  siteUrl: `https://aadigitalworks.github.io/${repo}`,
  generateRobotsTxt: true,
  outDir: './out',
  generateIndexSitemap: false,
  changefreq: 'weekly',
};
