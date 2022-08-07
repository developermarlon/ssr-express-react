import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";
import express from "express";
import mcache from "memory-cache";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isTest = process.env.NODE_ENV === "test" || !!process.env.VITE_TEST_BUILD;

process.env.MY_CUSTOM_SECRET = "API_KEY_qwertyuiop";

export async function createServer(
  root = process.cwd(),
  isProd = process.env.NODE_ENV === "production",
  hmrPort
) {
  const resolve = (p) => path.resolve(__dirname, p);

  const indexProd = isProd
    ? fs.readFileSync(resolve("dist/client/index.html"), "utf-8")
    : "";

  const app = express();

  /**
   * @type {import('vite').ViteDevServer}
   */
  let vite;
  if (!isProd) {
    vite = await (
      await import("vite")
    ).createServer({
      root,
      logLevel: isTest ? "error" : "info",
      server: {
        middlewareMode: true,
        watch: {
          // During tests we edit the files too fast and sometimes chokidar
          // misses change events, so enforce polling for consistency
          usePolling: true,
          interval: 100,
        },
        hmr: {
          port: hmrPort,
        },
      },
      appType: "custom",
    });
    // use vite's connect instance as middleware
    app.use(vite.middlewares);
  } else {
    app.use((await import("compression")).default());
    app.use(
      (await import("serve-static")).default(resolve("dist/client"), {
        index: false,
      })
    );
  }

  const sendPage = async (req, res) => {
    try {
      const url = req.originalUrl;

      if (!req.template)
        req.template = `<!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </head>
            <body>
              <div id="app"><!--app-html--></div>
              <script type="module" src="/src/entry-client.jsx"></script>
            </body>
          </html>
        `;

      let template, render;
      if (!isProd) {
        template = await vite.transformIndexHtml(url, req.template);

        render = (await vite.ssrLoadModule("/src/entry-server.jsx")).render;
      } else {
        template = indexProd;
        render = (await import("./dist/server/entry-server.js")).render;
      }

      const context = {};
      const appHtml = render(url, context);

      if (context.url) {
        return res.redirect(301, context.url);
      }

      let html = template.replace(`<!--app-html-->`, appHtml);

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      !isProd && vite.ssrFixStacktrace(e);
      console.log(e.stack);
      res.status(500).end(e.stack);
    }
  };

  var cache = (duration) => {
    return (req, res, next) => {
      let key = "__express__" + req.originalUrl || req.url;
      let cachedBody = mcache.get(key);
      if (cachedBody) {
        res.status(200).end(cachedBody);
        return;
      } else {
        res.endResponse = res.end;
        res.end = (body) => {
          mcache.put(key, body, duration * 1000);
          res.endResponse(body);
        };
        next();
      }
    };
  };

  app.use(cache(60));
  app.use("/example", sendPage);
  app.use(["/home", "/"], sendPage);

  return { app, vite };
}

if (!isTest) {
  createServer().then(({ app }) =>
    app.listen(5173, () => {
      console.log("http://localhost:5173");
    })
  );
}
