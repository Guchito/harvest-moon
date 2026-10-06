# Harvest Moon · Plan de la web

Dirección elegida: **Opción A · Noche** (ver `design/opciones.html`).

## Stack

| Qué                 | Elección                                                                 | Por qué                                                          |
| ------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| Framework           | Next.js 15, App Router, TypeScript, static generation                    | Todo es contenido estático; sin servidor que mantener            |
| Estilos             | Tailwind v4                                                              | Tokens de la opción A como variables CSS                         |
| Fuente              | Archivo (variable), self-hosted con `next/font`                          | Es la del mockup, open source                                    |
| Iconos              | `@phosphor-icons/react`                                                  | Solo los 4-5 que hagan falta (menú, flechas, redes)              |
| Animación           | CSS transitions; `motion/react` solo si hace falta un reveal             | Mantener ligero                                                  |
| Contenido           | Markdown + frontmatter en `content/`, leído con `gray-matter` + `marked` | Es lo que edita Pages CMS                                        |
| CMS                 | Pages CMS (`.pages.yml` en la raíz del repo, app de GitHub)              | Edita commits directos; sin base de datos                        |
| Formulario contacto | Web3Forms o Formspree (gratis, sin backend)                              | Un `action` en el `<form>`; cuando llegue el bookeo se sustituye |
| Hosting             | Vercel, deploy automático en cada commit                                 | Pages CMS → commit → rebuild en ~1 min                           |
| Dominio             | harvestmoonevents.eu apuntado a Vercel al final                          | Hasta entonces, URL de preview                                   |

## Rutas (se conservan los slugs actuales para SEO)

| Ruta                               | Página                                     | Fuente                                                     |
| ---------------------------------- | ------------------------------------------ | ---------------------------------------------------------- |
| `/`                                | Inicio                                     | `content/pages/inicio.md` + 3 artistas + 2 posts recientes |
| `/artistas`                        | Roster                                     | `content/artistas/*.md`                                    |
| `/artistas/[slug]`                 | Ficha de DJ (nueva)                        | mismo archivo; base para el bookeo futuro                  |
| `/about`                           | Servicios ("Juntos en cada paso", precios) | `content/pages/servicios.md`                               |
| `/quienes-somos`                   | Historia de Rodrigo                        | `content/pages/quienes-somos.md`                           |
| `/blog-de-novedades`               | Lista de posts                             | `content/blog/*.md`                                        |
| `/blog-de-novedades/[slug]`        | Post                                       | idem                                                       |
| `/contact`                         | Contacto + formulario                      | `content/pages/contacto.md` (datos)                        |
| `/terminos-y-condiciones`          | Términos                                   | `content/pages/terminos.md`                                |
| `/lo-mas-importante-de-una-boda/*` | redirect 301 → `/blog-de-novedades`        | URLs viejas de Squarespace                                 |

## Modelo de contenido (lo que edita el cliente en Pages CMS)

**Artista** (`content/artistas/dj-re.md`)

```yaml
name: Dj Re!
slug: dj-re
photo: /media/artistas/dj-re.jpeg
genres: [House, Rock & Soul, Funk, Breaks]
events: [Bodas, Eventos de empresa, Pool party]
spotify: https://open.spotify.com/... # opcional
order: 1
---
Bio en markdown.
```

**Post** (`content/blog/la-epoca-dorada-de-los-lentos.md`)

```yaml
title: La época dorada de los lentos
date: 2025-01-24
cover: /media/blog/lentos.jpg
excerpt: Abrimos el cajón del romance...
---
Cuerpo en markdown.
```

**Páginas fijas**: título, texto, imagen de cabecera. Datos de contacto (email, teléfono, dirección, redes) en `content/site.json` para que el pie y el contacto compartan fuente.

Imágenes: `public/media/` (Pages CMS `media.input: public/media`, `output: /media`).

## Fases

1. **Base** (día 1): scaffold Next.js, tokens de la opción A, nav, footer, tipografía, 404. Repo en GitHub, deploy en Vercel.
2. **Contenido + CMS** (día 1-2): `.pages.yml`, migrar los textos y fotos actuales (3 DJs, 5 posts, páginas fijas). Conectar Pages CMS y comprobar que un cambio desde el CMS publica.
3. **Páginas** (día 2-4): inicio, artistas + ficha, servicios, quiénes somos, blog + post, contacto, términos. Responsive y revisión en móvil.
4. **Remate** (día 4-5): formulario con email, metadatos/OG/sitemap, redirects, Lighthouse, accesibilidad básica.
5. **Lanzamiento**: invitar al cliente a Pages CMS (necesita cuenta GitHub como colaborador del repo), cambiar DNS, cerrar Squarespace.

## Fuera de alcance ahora (fases futuras)

- **Bookeo**: formulario multipaso (fecha, tipo de evento, DJ, presupuesto). Necesitará backend (base de datos + email + calendario). Las fichas `/artistas/[slug]` ya dejan el gancho.
- **Luces y presupuesto**: configurador de iluminación con precio orientativo. Depende del bookeo.
- **Idiomas**: la web actual tiene selector de idioma pero el contenido está solo en español. Se queda en español; i18n se añade si hace falta.
- **Tienda/carrito**: el `/cart` de Squarespace no se usa. Se elimina.

## Pendiente de confirmar con el cliente

1. Cuenta de GitHub para el repo (¿la tuya o la del cliente?) y de Vercel.
2. Email que recibe el formulario (¿info@harvestmoonevents.eu?).
3. Acceso al DNS de harvestmoonevents.eu para el cambio final.
4. ¿Fichas individuales de DJ sí o no? (Recomendado: sí, por el bookeo.)
5. Redes sociales a enlazar (Instagram, Spotify).
