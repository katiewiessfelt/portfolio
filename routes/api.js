import { Router } from "express";
import { SitemapStream, streamToPromise } from "sitemap";
import { createGzip } from "zlib";

const router = Router();

let sitemapCache = null;
let sitemapCacheTime = 0; // Timestamp of last generation
const CACHE_DURATION = 1000 * 60 * 60 * 12; // 12 hours

router.get("/sitemap.xml", async (req, res) => {
  res.header("Content-Type", "application/xml");
  res.header("Content-Encoding", "gzip");
  res.header("Cache-Control", "public, max-age=43200"); // 12 hours

  // Serve from cache if still valid
  if (sitemapCache && Date.now() - sitemapCacheTime < CACHE_DURATION) {
    console.log("Serving sitemap from cache");
    return res.send(sitemapCache);
  }

  try {
    console.log("Generating new sitemap...");

    const sitemapStream = new SitemapStream({
      hostname: "https://katiewiessfelt.onrender.com",
    });
    const gzipStream = sitemapStream.pipe(createGzip());

    sitemapStream.write({ url: "/", changefreq: "monthly", priority: 1.0 });
    sitemapStream.write({
      url: "/about",
      changefreq: "monthly",
      priority: 0.8,
    });
    sitemapStream.write({
      url: "/projects",
      changefreq: "monthly",
      priority: 0.8,
    });
    sitemapStream.write({
      url: "/work-history",
      changefreq: "monthly",
      priority: 0.8,
    });

    const projects = [
      { slug: "TIBI", lastmod: "2025-10-09" },
      { slug: "bed-and-biscuits", lastmod: "2025-10-09" },
      { slug: "portfolio", lastmod: "2025-10-09" },
    ];

    projects.forEach((project) => {
      sitemapStream.write({
        url: `/projects/${project.slug}`,
        changefreq: "monthly",
        priority: 0.7,
        lastmodISO: project.lastmod,
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
    console.error("Error generating sitemap:", err);
    res.status(500).end();
  }
});

router.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send(
    `User-agent: *<br/>
    Allow: /<br/>
    Sitemap: https://katiewiessfelt.onrender.com/api/sitemap.xml`,
  );
});

// skills graph on home page
router.get("/skills-graph", (req, res) => {
  res.json(
  {
    name: "Skills",
    color: 0x00ffff, // cyan
    children: [
      {
        name: "Languages",
        color: 0xff7700, // orange
        children: [
          {
            name: "Frontend",
            children: [
              {
                name: "Express.js",
                value: 4,
                image: "/images/logos/express-js.png",
                experience: [
                  { label: "Personal Project: Portfolio", link: "https://github.com/katiewiessfelt/portfolio" },
                  { label: "Nine by Six", years: 1, link: "/work-history#9x6" },
                ]
              },
              {
                name: "Svelte",
                value: 3,
                image: "/images/logos/svelte.png",
                experience: [
                  { label: "Personal Project: TIBI" }
                ]
              },
              {
                name: "React",
                value: 2,
                image: "/images/logos/react-js.png",
                experience: [
                  { label: "Personal Project: Bed and Biscuits", link: "https://github.com/katiewiessfelt/bed-and-biscuits" },
                  { label: "School, UW-Stevens Point: Capstone", years: .5 }
                ]
              },
              {
                name: "Wordpress",
                value: 2,
                image: "/images/logos/wordpress.png",
                experience: [
                  { label: "WIPPS", years: 1.5, link: "/work-history#wipps" },
                  { label: "Nine by Six", years: 1.5, link: "/work-history#9x6" }
                ]
              },
              {
                name: "HTML",
                value: 5,
                image: "/images/logos/html.png",
                experience: [
                  { label: "School, UW-Stevens Point", years: 1 },
                  { label: "Wildcard", years: 2.5, link: "/work-history#wildcard-intern" },
                  { label: "Nine by Six", years: 1.5, link: "/work-history#9x6" },
                ]
              },
              {
                name: "JS",
                image: "/images/logos/javascript.png",
                experience: [
                  { label: "School, UW-Stevens Point", years: 1 },
                  { label: "Wildcard", years: 2.5, link: "/work-history#wildcard-intern" },
                  { label: "Nine by Six", years: 1.5, link: "/work-history#9x6" },
                ],
                children: [
                  {
                    name: "jQuery",
                    value: 5,
                    image: "/images/logos/jquery.png",
                    experience: [
                      { label: "School, UW-Stevens Point", years: 1 },
                      { label: "Wildcard", years: 2.5, link: "/work-history#wildcard-intern" },
                      { label: "Nine by Six", years: 1.5, link: "/work-history#9x6" },
                    ]
                  }
                ],
              },
            ],
          },
          {
            name: "Backend",
            children: [
              {
                name: "XML",
                value: 2,
                image: "/images/logos/xml.png",
                experience: [
                  { label: "Wildcard", years: 2, link: "/work-history#wildcard" }
                ]
              },
              {
                name: "Python",
                value: 5,
                image: "/images/logos/python.png",
                experience: [
                  { label: "Wildcard", years: 2.5, link: "/work-history#wildcard-intern" },
                ]
              },
              {
                name: "PHP",
                value: 4,
                image: "/images/logos/php.png",
                experience: [
                  { label: "School, UW-Stevens Point", years: .5 },
                  { label: "Nine by Six", years: 1.5, link: "/work-history#9x6" },
                ]
              },
              {
                name: "Node.js",
                value: 4,
                image: "/images/logos/node-js.png",
                experience: [
                  { label: "Personal Project: Portfolio", link: "https://github.com/katiewiessfelt/portfolio" },
                  { label: "Nine by Six", years: 1, link: "/work-history#9x6" },
                ]
              },
              {
                name: "Java",
                value: 1,
                image: "/images/logos/java.png",
                experience: [
                  { label: "School, UW-Stevens Point", years: 1 }
                ]
              },
              {
                name: "Ruby",
                value: 1,
                image: "/images/logos/ruby.png",
              },
            ],
          },
        ],
      },
      {
        name: "Styling",
        color: 0xffff00, // yellow
        children: [
          {
            name: "CSS",
            image: "/images/logos/css.png",
            experience: [
              { label: "School, UW-Stevens Point", years: 1.5 },
              { label: "Wildcard", years: 2.5, link: "/work-history#wildcard-intern" },
              { label: "Nine by Six", years: 1.5, link: "/work-history#9x6" },
            ],
            children: [
              {
                name: "LESS",
                value: 1,
                image: "/images/logos/less.png",
                experience: [
                  { label: "Wildcard", years: 2.5, link: "/work-history#wildcard-intern" }
                ]
              },
              {
                name: "SASS",
                value: 1,
                image: "/images/logos/sass.png",
                experience: [
                  { label: "Wildcard", years: 2.5, link: "/work-history#wildcard-intern" },
                  { label: "Nine by Six", years: 1.5, link: "/work-history#9x6" },
                ]
              },
            ],
          },
          {
            name: "Tailwind",
            value: 1,
            image: "/images/logos/tailwind.png",
            experience: [
              { label: "Personal Project: TIBI" }
            ]
          },
          {
            name: "Skeleton",
            value: 1,
            image: "/images/logos/skeleton.png",
            experience: [
              { label: "Personal Project: TIBI" }
            ]
          },
          {
            name: "Bootstrap",
            value: 5,
            image: "/images/logos/bootstrap.png",
            experience: [
              { label: "School, UW-Stevens Point", years: 1 },
              { label: "Wildcard", years: 2.5, link: "/work-history#wildcard-intern" },
              { label: "Nine by Six", years: 1.5, link: "/work-history#9x6" },
            ]
          },
        ],
      },
      {
        name: "UI/UX",
        color: 0x00ff00, // green
        children: [
          {
            name: "AdobeXD",
            value: 2,
            image: "/images/logos/adobe-xd.png",
            experience: [
              { label: "School, UW-Stevens Point", years: 1 }
            ]
          },
          {
            name: "Figma",
            value: 4,
            image: "/images/logos/figma.png",
            experience: [
              { label: "School, UW-Stevens Point", years: 1 },
              { label: "Coursera: Create a High-Fidelity Prototype with Figma" },
              { label: "Personal Projects: Wireframing", link: "/projects"},
            ]
          },
        ],
      },
      {
        name: "Testing",
        color: 0x8a2be2, // purple
        children: [
          {
            name: "Cypress",
            value: 1,
            image: "images/logos/cypress.png",
            experience: [
              { label: "Coursera: Cypress UI automation testing for absolute beginners" },
            ]
          },
          {
            name: "UnitTest",
            value: 5,
            image: "images/logos/unittest.png",
            experience: [
              { label: "Wildcard", years: 2.5, link: "/work-history#wildcard-intern" }
            ]
          },
          {
            name: "Pytest",
            value: 3,
            image: "images/logos/pytest.png",
            experience: [
              { label: "Wildcard", years: 1, link: "/work-history#wildcard-intern" }
            ]
         },
          {
            name: "Selenium",
            value: 3,
            image: "images/logos/selenium.png",
            experience: [
              { label: "Wildcard", years: 1, link: "/work-history#wildcard" }
            ]
         },
          {
            name: "MinIO",
            value: 3,
            image: "images/logos/MinIO.png",
            experience: [
              { label: "Wildcard", years: 1, link: "/work-history#wildcard" }
            ]
         },
        ],
      },
      {
        name: "Database",
        color: 0x0000ff, // blue
        children: [
          {
            name: "Github",
            value: 4,
            image: "images/logos/github.png",
            experience: [
              { label: "School, UW-Stevens Point", years: .5 },
              { label: "Wildcard", years: 2.5, link: "/work-history#wildcard-intern" },
              { label: "Nine by Six", years: 1.5, link: "/work-history#9x6" },
            ]
          },
          {
            name: "Nginx",
            value: 1,
            image: "images/logos/nginx.png"
          },
          {
            name: "NoSQL",
            children: [
              {
                name: "Redis",
                value: 3,
                image: "images/logos/redis.png",
                experience: [
                  { label: "Wildcard", years: 1.5, link: "/work-history#wildcard" },
                  { label: "Personal Project: TIBI" }
                ]
              },
              {
                name: "CouchDB",
                value: 4,
                image: "/images/logos/couchdb.png",
                experience: [
                  { label: "Wildcard", years: 1.5, link: "/work-history#wildcard" }
                ]
              },
            ],
          },
          {
            name: "Relational",
            children: [
              {
                name: "PostgreSQL",
                value: 1,
                image: "images/logos/postgresql.png",
                experience: [
                  { label: "Wildcard", years: .5, link: "/work-history#wildcard-intern" }
                ]
              },
              {
                name: "MySQL",
                value: 4,
                image: "/images/logos/mysql.png",
                experience: [
                  { label: "Nine by Six", years: 1.5, link: "/work-history#9x6" }
                ]
              },
            ],
          },
        ],
      },
      {
        name: "Contianers",
        color: 0xff00ff, // pink
        children: [
          {
            name: "Docker",
            value: 4,
            image: "images/logos/docker.png",
            experience: [
              { label: "Wildcard", years: 2.5, link: "/work-history#wildcard-intern" },
              { label: "Nine by Six", years: 1.5, link: "/work-history#9x6" },
            ]
          },
          {
            name: "Podman",
            value: 4,
            image: "images/logos/podman.png",
            experience: [
              { label: "Wildcard", years: 2.5, link: "/work-history#wildcard-intern" },
              { label: "Nine by Six", years: 1.5, link: "/work-history#9x6" },
            ]
          },
        ],
      },
    ],
  });
});

export default router;
