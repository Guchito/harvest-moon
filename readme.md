# Harvest Moon

Harvest Moon is a Spanish-language website for a Barcelona-based DJ and events agency. It presents the agency's services, artists, playlists, testimonials, and blog, and lets prospective clients get in touch. Staff can also create branded event proposals in a private quote builder.

## Features

- Public pages for the agency, services, artists, playlists, blog, contact, and legal information.
- Content-driven artist profiles, blog posts, playlists, testimonials, and page copy.
- Contact form that sends enquiries by email.
- Private quote builder at `/admin/presupuestos` that generates downloadable PDF proposals. Drafts are held in the browser and are not saved to a database.
- SEO metadata, sitemap, robots rules, Open Graph images, and Vercel Analytics.

## Tech stack

- Next.js 16 (App Router) and React 19
- TypeScript
- Tailwind CSS 4
- Markdown content parsed with `gray-matter` and `marked`
- Resend for outbound email
- PDFKit for quote PDFs

## Getting started

Use Node.js and npm versions compatible with the project's Next.js dependencies.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The site can be browsed without quote-admin credentials, but contact email delivery requires a configured Resend API key.

### Environment variables

Set these in `.env.local` for local development and in the hosting provider's environment settings for deployment:

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Resend API key used to send contact enquiries. |
| `MAIL_FROM` | Optional sender address; defaults to `Harvest Moon <onboarding@resend.dev>`. Configure a sender verified with Resend for production email. |
| `EMAIL` | Contact email shown on the site and recipient for contact-form enquiries. |
| `ADDRESS` | Business address shown on the site and legal pages. |
| `PHONE` | Contact phone shown on the site and legal pages. |
| `QUOTE_ADMIN_USERNAME` | Username for the private quote builder. |
| `QUOTE_ADMIN_PASSWORD` | Password for the quote builder; must be at least 12 characters. |
| `QUOTE_SESSION_SECRET` | Secret used to sign quote-admin sessions; must be at least 32 characters. |

Set `EMAIL`, `ADDRESS`, and `PHONE` to the current contact details. The quote builder remains unavailable until all three `QUOTE_*` variables are valid. Keep credentials and API keys out of source control.

## Project structure

```text
content/
  artistas/       Artist profiles (Markdown with frontmatter)
  blog/           Blog posts (Markdown with frontmatter)
  pages/          Page copy (Markdown with frontmatter)
  playlists/      Playlist details (Markdown with frontmatter)
  testimonios/    Testimonials (Markdown with frontmatter)
  site.json       Company name, tagline, and social links
public/media/     Images and videos used by the site
src/app/          Next.js routes and route handlers
src/components/   Shared UI components
src/lib/          Content loading, email, authentication, and metadata helpers
```

Content is read from the repository at build/request time by `src/lib/content.ts`. Most collections use Markdown files with YAML frontmatter; company-wide contact details are in `content/site.json`. The `.pages.yml` file describes the content collections and fields for Pages CMS.

## Useful commands

```bash
npm run dev      # Start the local development server
npm run lint     # Run ESLint
npm run build    # Create a production build
npm run start    # Serve the production build
```

The PDF generation route uses the Node.js runtime, so deploy to a host that supports Next.js server routes and Node.js APIs.
