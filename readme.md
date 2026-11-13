# Harvest Moon

Website for **Harvest Moon**, a Barcelona-based DJ and events agency, live at [harvestmoonevents.eu](https://www.harvestmoonevents.eu). The site is in Spanish and covers the agency's services, artists, playlists, testimonials and blog, with a contact form for enquiries. Staff also get a private quote builder that produces branded PDF proposals.

## Quick start

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev                  # http://localhost:3000
```

You can browse the whole site locally with an empty `.env.local`. Sending the contact form needs a Resend key, and the quote builder needs the `QUOTE_*` variables.

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the dev server |
| `npm run lint` | Runs ESLint |
| `npm run build` | Creates a production build |
| `npm run start` | Serves the production build |

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `EMAIL` | On Vercel | Contact email shown on the site; contact-form enquiries are also sent here. |
| `PHONE` | On Vercel | Phone number shown on the site and legal pages. |
| `ADDRESS` | On Vercel | Business address shown on the site and legal pages. |
| `RESEND_API_KEY` | For email | [Resend](https://resend.com) API key used by the contact form. |
| `MAIL_FROM` | No | Sender address. Defaults to `Harvest Moon <onboarding@resend.dev>`; production needs a sender verified in Resend. |
| `QUOTE_ADMIN_USERNAME` | For quotes | Login username for the quote builder. |
| `QUOTE_ADMIN_PASSWORD` | For quotes | Login password, at least 12 characters. |
| `QUOTE_SESSION_SECRET` | For quotes | Random string of at least 32 characters, used to sign admin sessions. |

> **Note:** Builds on Vercel **fail** if `EMAIL`, `PHONE` or `ADDRESS` is missing, so the site never goes live with blank contact details. Locally they just render empty.
>
> Generate a session secret with `openssl rand -base64 48`. Never commit `.env.local`.

## Pages

| Route | Page |
| --- | --- |
| `/` | Home |
| `/quienes-somos` | About the agency |
| `/artistas`, `/artistas/[slug]` | Artist roster and profiles |
| `/playlists` | Spotify playlists, loaded only after the visitor consents |
| `/blog-de-novedades`, `/blog-de-novedades/[slug]` | Blog |
| `/contact` | Contact form (with a honeypot field against spam) |
| `/aviso-legal`, `/politica-de-privacidad`, `/politica-de-cookies`, `/terminos-y-condiciones` | Legal pages |
| `/admin/presupuestos` | Quote builder (login required) |

The site also serves `sitemap.xml`, `robots.txt`, Open Graph images and icons, and loads Vercel Analytics. Old Squarespace URLs are redirected in `next.config.ts`.

## Editing content

All copy lives in `content/` as Markdown files with YAML frontmatter, so you can edit it without touching code:

```text
content/
  artistas/      One file per artist (name, photo, genres, links, order, bio)
  blog/          One file per post
  pages/         Copy for the home, about, services, contact and legal pages
  playlists/     Playlist details and Spotify links
  testimonios/   Client testimonials
  site.json      Company name, tagline and social links
public/media/    Images and videos
```

`.pages.yml` sets up [Pages CMS](https://pagescms.org), which gives non-developers a form-based editor for the same files. Contact details are **not** stored in `content/`; they come from the `EMAIL`, `PHONE` and `ADDRESS` environment variables.

## Quote builder

At `/admin/presupuestos`, staff can put together an event proposal and download it as a PDF made with PDFKit. Drafts are kept in the browser only, with no database. The builder stays disabled until all three `QUOTE_*` variables are set and valid.

## Code layout

```text
src/app/          Routes, server actions and route handlers
src/components/   Shared UI components
src/lib/          Content loading (content.ts), email (mail.ts), quote auth, OG images, cookie consent
```

**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, `gray-matter` + `marked`, Resend, PDFKit.

## Deployment

The site is built for Vercel. Keep these points in mind:

- The PDF route (`/admin/api/presupuesto`) runs on the Node.js runtime. It reads images from `public/` at runtime, and they are listed under `outputFileTracingIncludes` in `next.config.ts`. If you change those images, update that list.
- The canonical URL is fixed as `SITE_URL` in `src/lib/content.ts`. Change it there if the domain ever changes.
