# Connecting Backend (Laravel) with Frontend (React)

## Overview

- **Backend (compressedPDF-cms):** Laravel + Vue admin for SEO and content. Exposes a **public API** (no auth) for pages and blogs with SEO data.
- **Frontend (React, `src/`):** Vite + React app. Fetches pages/blogs from the backend and displays them with SEO (title, meta, Open Graph).

## Backend – Public API (no login)

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/public/pages` | List published pages (for nav) |
| GET | `/api/public/pages/{slug}` | Single page by slug (content + SEO) |
| GET | `/api/public/blogs` | List published blogs |
| GET | `/api/public/blogs/{slug}` | Single blog by slug (content + SEO) |

## Run both

1. **Start Laravel (backend)**  
   From `compressedPDF-cms`:
   ```bash
   npm run dev:all
   ```
   Backend: **http://localhost:8000**

2. **Start React (frontend)**  
   From project root:
   ```bash
   cp .env.example .env   # first time only
   npm run dev
   ```
   Frontend: **http://localhost:5000** (or port in `vite.config.js`)

3. **Point React to the backend**  
   In the React app root, create or edit `.env`:
   ```
   VITE_API_URL=http://localhost:8000
   ```
   Restart `npm run dev` after changing `.env`.

## Frontend behaviour

- **Home page:** Shows a “Pages” and “Blog” section (if the backend returns data) with links to CMS content.
- **Page by slug:** `/:lang/page/:slug` (e.g. `/en/page/about-us`) loads the page from the API and sets document title, meta description, canonical, robots, and Open Graph from the backend.
- **Blog by slug:** `/:lang/blog/:slug` same for blog posts.

CORS is allowed from `http://localhost:5000` and `http://localhost:5173` (see `compressedPDF-cms/config/cors.php`). For other origins, add them to `allowed_origins` in that file.
