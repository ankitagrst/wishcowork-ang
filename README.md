# WishCowork - Premium Coworking Website

A modern, responsive coworking website built with Angular 17+ and TailwindCSS, featuring dynamic routing, real property listings, and professional design.

## 🚀 Quick Start

```bash
npm install
npx ng serve
```

Visit: `http://localhost:4200/`

## ✨ Features

- Dynamic routing with SEO-friendly URLs
- Real property listings with high-quality images
- Professional responsive design
- Advanced search and filtering
- Property booking system
- Admin-ready architecture

## 🛠️ Tech Stack

- Angular 17+ with Standalone Components
- TailwindCSS for styling
- TypeScript for type safety
- Angular Universal for SSR/SEO
- Real images from placeholder services

## Configuration & Security Notes

- Backend environment variables (recommended for production):
	- `JWT_SECRET` — set a strong secret for signing JWT tokens (overrides the default in `api/config/database.php`).
	- `CORS_ORIGIN` — set allowed CORS origin(s) instead of `*`.
	- `INITIAL_SUPERUSER_EMAIL`, `INITIAL_SUPERUSER_PASSWORD`, `INITIAL_SUPERUSER_NAME` — optional values used by `api/setup/auto-setup.php` to create an initial `superuser` account if none exists.

- Frontend configuration:
	- App settings (API URL, mock mode, Application Name, Support Email) are editable via Admin → Settings and stored in localStorage.

Security reminder: change default demo credentials and seeded superuser password before deploying. Avoid using default secrets in production.
