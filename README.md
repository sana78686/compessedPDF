# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Deploying to Apache (live server)

1. Build: `npm run build`. Deploy the **entire** contents of the `dist/` folder to your document root (e.g. `pdf.apimstec.com`). The build copies `public/.htaccess` into `dist/`, which tells Apache to serve `index.html` for routes like `/en`, `/en/tools`, `/id`, etc., so direct links work.

2. **If direct links still show a blank page or 500 error**, Apache is not applying `.htaccess`. Add this to your Apache vhost config for this site (so it applies even when `.htaccess` is disabled):

   ```apache
   <Directory "/path/to/your/document/root">
       AllowOverride All
       RewriteEngine On
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteCond %{REQUEST_FILENAME} !-d
       RewriteRule ^ index.html [L]
   </Directory>
   ```

   Also enable `mod_rewrite` (e.g. on Ubuntu: `sudo a2enmod rewrite`) and restart Apache.
