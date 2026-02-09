# API Server (PHP)

This folder contains a lightweight PHP API used by the frontend for authentication, properties, news, events, and admin operations.

## Important Environment Variables

- `JWT_SECRET` — recommended: set a strong random string for signing JWT tokens. If not set, a default placeholder is used in `api/config/database.php`.
- `CORS_ORIGIN` — recommended: set to your site domain in production (overrides `*`).
- `INITIAL_SUPERUSER_EMAIL`, `INITIAL_SUPERUSER_PASSWORD`, `INITIAL_SUPERUSER_NAME` — optional values read by `api/setup/auto-setup.php` to seed a `superuser` account if none exists.

## Notes

- The `auto-setup.php` script will create database tables and seed sample data. It will also create an initial `superuser` if one doesn't exist.
- For production, ensure `JWT_SECRET` and `INITIAL_SUPERUSER_PASSWORD` are set to secure values and not the defaults.
- Update `CORS_ORIGIN` to restrict cross-origin requests.
