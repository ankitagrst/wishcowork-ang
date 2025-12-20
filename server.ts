import { APP_BASE_HREF } from '@angular/common';
import { AngularAppEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import bootstrap from './src/main.server';

// The Express app is exported so that it can be used by serverless Functions.
export function app(port: number = 4000): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const document = readFileSync(indexHtml, 'utf-8');

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Prepare an SSR engine lazily at runtime to support multiple angular-ssr versions
  let ssrEngine: any | null = null;

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve assets (images, fonts, etc.) without long caching so updates show immediately
  server.use('/assets', express.static(join(browserDistFolder, 'assets'), {
    maxAge: 0
  }));

  // Serve other static files (compiled JS/CSS) with long caching (fingerprinted in production)
  server.get('*.*', express.static(browserDistFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Angular engine
  server.get('*', async (req, res, next) => {
    const { protocol, originalUrl, baseUrl } = req;

    // Build a safe origin for SSR fetches - do NOT use headers.host (could be from a dev proxy)
    const origin = `${protocol}://${req.hostname}:${port}`;
    const url = new URL(originalUrl, origin).toString();

    // Lazy load Angular SSR to allow compatibility with multiple versions
    if (!ssrEngine) {
      try {
        const ssr = await import('@angular/ssr');
        const anySSR = ssr as any;
        ssrEngine = anySSR.CommonEngine ? new anySSR.CommonEngine() : (anySSR.AngularAppEngine ? new anySSR.AngularAppEngine() : null);
      } catch (err) {
        // If import fails, keep ssrEngine null and fall back to static document
        ssrEngine = null;
      }
    }

    if (!ssrEngine) {
      // SSR not available or failed to initialize - fall back to returning the plain index
      return res.send(document);
    }

    try {
      // Try to detect API on the engine and call the appropriate method
      if (typeof ssrEngine.render === 'function') {
        const html = await ssrEngine.render({
          bootstrap,
          documentFilePath: indexHtml,
          url,
          publicPath: browserDistFolder,
          providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
        });
        return res.send(html);
      }

      if (typeof ssrEngine.renderApplication === 'function') {
        const html = await ssrEngine.renderApplication(url, { document, providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }] });
        return res.send(html);
      }

      // Fallback to static document - we didn't find a compatible method
      return res.send(document);
    } catch (err) {
      return next(err);
    }
  });

  return server;
}

function run(): void {
  const port = Number(process.env['PORT']) || 4000;

  // Start up the Node server
  const server = app(port);
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
