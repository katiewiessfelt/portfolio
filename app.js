const express = require('express');
const path = require('path');
const { SitemapStream, streamToPromise } = require('sitemap');
const { createGzip } = require('zlib');

const app = express();

// Serve fontawesome
app.use("/fa", express.static(path.join(process.cwd(), "node_modules/@fortawesome/fontawesome-free"))
);

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Set the directory for static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nSitemap: https://katiewiessfelt.onrender.com/sitemap.xml`);
});

let sitemapCache = null;
let sitemapCacheTime = 0; // Timestamp of last generation
const CACHE_DURATION = 1000 * 60 * 60 * 12; // 12 hours

app.get('/sitemap.xml', async (req, res) => {
  // Serve from cache if still valid
  if (sitemapCache && Date.now() - sitemapCacheTime < CACHE_DURATION) {
    console.log('Serving sitemap from cache');
    res.header('Content-Type', 'application/xml');
    res.header('Content-Encoding', 'gzip');
    return res.send(sitemapCache);
  }

  try {
    console.log('Generating new sitemap...');
    res.header('Content-Type', 'application/xml');
    res.header('Content-Encoding', 'gzip');

    const sitemapStream = new SitemapStream({ hostname: 'https://katiewiessfelt.onrender.com' });
    const gzipStream = sitemapStream.pipe(createGzip());

    sitemapStream.write({ url: '/', changefreq: 'monthly', priority: 1.0 });
    sitemapStream.write({ url: '/about', changefreq: 'monthly', priority: 0.8 });
    sitemapStream.write({ url: '/projects', changefreq: 'monthly', priority: 0.8 });
    sitemapStream.write({ url: '/work-history', changefreq: 'monthly', priority: 0.8 });

    const projects = [
      { slug: 'TIBI', lastmod: '2025-10-09' },
      { slug: 'bed-and-biscuits', lastmod: '2025-10-09' },
      { slug: 'portfolio', lastmod: '2025-10-09' }
    ];

    projects.forEach(project => {
      sitemapStream.write({
        url: `/projects/${project.slug}`,
        changefreq: 'monthly',
        priority: 0.7,
        lastmodISO: project.lastmod
      });
    });

    sitemapStream.end();

    // Convert to buffer and cache it
    const buffer = await streamToPromise(gzipStream);
    sitemapCache = buffer;
    sitemapCacheTime = Date.now();

    // Send response
    res.send(buffer);
  } catch (err) {
    console.error('Error generating sitemap:', err);
    res.status(500).end();
  }
});

app.get('/', (req, res) => {
  res.render('home', { title: 'Home Page' });
});

app.get('/about', (req, res) => {
  res.render('about', { title: 'About Me' });
});

app.get('/work-history', (req, res) => {
  res.render('work_history', { title: 'Work History' });
});

// -- projects
app.get('/projects', (req, res) => {
  res.render('projects', { title: 'Projects' });
});

app.get('/projects/TIBI', (req, res) => {
  res.render('projects/TIBI', { title: 'TIBI' });
});

app.get('/projects/bed-and-biscuits', (req, res) => {
  res.render('projects/bed_and_biscuits', { title: 'Bed and Biscuits' });
});

app.get('/projects/portfolio', (req, res) => {
  res.render('projects/portfolio', { title: 'Katie Wiessfelt' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});