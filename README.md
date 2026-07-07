[![semantic-release: angular](https://img.shields.io/badge/semantic--release-conventional-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

# lucabertelli.consulting Portfolio and Blog

Welcome to the official repository for Luca Bertelli's portfolio and blog site, showcasing the expertise and experience of a Cloud Native Engineer, Advisor, Consultant, and Developer. 🚀

## Overview

This website is designed to provide a comprehensive view of Luca Bertelli's professional journey, skills, and insights into the world of cloud-native technologies. Whether you are looking for information about cloud architecture, development strategies, or seeking consultation services, this site is the go-to resource. 🌐

## Technologies Used

The site is built with [Astro](https://astro.build/) v7 in server-rendered (SSR) mode and deployed to [Cloudflare Workers](https://workers.cloudflare.com/) through the [`@astrojs/cloudflare`](https://docs.astro.build/en/guides/integrations-guide/cloudflare/) adapter. 🛠️

Key pieces of the stack:

- **Astro 7 (SSR):** Pages are rendered on the edge, with `astro check` type-checking as part of the build.
- **Cloudflare Workers + KV:** Hosting and key-value storage, configured in [wrangler.toml](wrangler.toml).
- **@astrojs/sitemap & astro-seo:** Sitemap generation and per-page SEO metadata.
- **SendGrid:** Powers the contact form email delivery.
- **semantic-release:** Automated versioning and releases from the `main` branch, following Conventional Commits.

## Features

- **Portfolio Showcase:** Explore Luca's past projects and discover the innovative solutions implemented in various cloud environments.

- **Blog:** Stay updated with the latest trends, insights, and best practices in cloud-native engineering. Luca shares his knowledge and experiences through thought-provoking articles and tutorials. 📚

- **Consulting Services:** Interested in leveraging cloud-native technologies for your business? Luca Bertelli offers advisory and consulting services. Get in touch to discuss how to optimize your cloud strategy. 🤝

- **Contact:** Reach out to Luca for inquiries, collaboration opportunities, or to schedule a consultation. The contact form ensures a seamless communication process. 📬

## Project structure

```plaintext
lucabertelli.consulting/
├── docs
│   ├── perf                  # Lighthouse baselines and post-change reports
│   └── SEO-KPI.md            # SEO checklist and KPIs
├── public                    # Static assets (images, fonts, styles, scripts, robots.txt, llms.txt)
├── scripts                   # Maintenance scripts for Cloudflare Pages deployments
├── src
│   ├── components            # Reusable Astro components
│   ├── constants             # Site-wide constants (canonical URL, etc.)
│   ├── content
│   │   ├── blog              # Blog articles (per language)
│   │   └── certifications    # Certification badges
│   ├── i18n                  # Translations and i18n utilities
│   ├── layouts               # Page layouts
│   ├── middleware.ts         # Astro middleware
│   ├── pages
│   │   └── [lang]            # Localized routes: index, blog, contact, cookies, privacy
│   ├── types                 # Shared TypeScript types
│   └── utils                 # Utility functions
├── astro.config.mjs          # Astro config (Cloudflare adapter, sitemap, Vite settings)
├── setupEnv.js               # Injects secrets into the environment at build time
└── wrangler.toml             # Cloudflare Workers and KV configuration
```

## Getting Started

Prerequisites: Node.js >= 22.12.0 and [pnpm](https://pnpm.io/).

1. Clone the repository and enter the project directory:

   ```bash
   git clone https://github.com/banshee86vr/lucabertelli.consulting.git
   cd lucabertelli.consulting
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. (Optional) Create a `.env` file for the events/tickets integration (in production these values are read from Cloudflare KV; without them the tickets section is simply hidden):

   ```bash
   SECRET_LOAD_EVENTS=true
   SECRET_EVENTS_API_URL=...
   SECRET_EVENTS_API_USERNAME=...
   SECRET_EVENTS_API_PASSWORD=...
   ```

4. Run the development server:

   ```bash
   pnpm dev
   ```

   Open your browser and visit [http://localhost:4321](http://localhost:4321) to view the site locally. 🌐

Other useful commands:

```bash
pnpm build     # astro check + production build
pnpm preview   # preview the production build locally
```

## Deployment

The site runs on Cloudflare Workers. [wrangler.toml](wrangler.toml) defines the Worker name, the KV namespaces (`lb_consulting` for runtime secrets, `SESSION` for sessions), and a `preview` environment. Releases are versioned automatically by semantic-release on pushes to `main`.

## SEO & discoverability

After changes to metadata, sitemaps, or structured data, use the post-deploy checklist and KPIs in [docs/SEO-KPI.md](docs/SEO-KPI.md). The site ships with `sitemap-index.xml` (from `@astrojs/sitemap`), [public/robots.txt](public/robots.txt), [public/llms.txt](public/llms.txt) for agent-oriented discovery, and per-route metadata in [src/layouts/Common.astro](src/layouts/Common.astro). Optional: set `PUBLIC_SITE_URL` if the canonical origin differs from `https://lucabertelli.consulting`.

## Contributions

If you have suggestions, improvements, or would like to report issues, feel free to open an [issue](https://github.com/banshee86vr/lucabertelli.consulting/issues) or submit a [pull request](https://github.com/banshee86vr/lucabertelli.consulting/pulls). 🙌

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details. 📄

---

Thank you for visiting Luca Bertelli Consulting! Explore, learn, and connect with the cloud-native community. 🌟
