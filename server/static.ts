import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { buildPageHtml } from "../shared/seo-inject";
import { seoDeps } from "./routes";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  app.use("/{*path}", async (req, res) => {
    try {
      const indexPath = path.resolve(distPath, "index.html");
      const html = await fs.promises.readFile(indexPath, "utf-8");
      const { html: injected, status } = await buildPageHtml(html, req.originalUrl, seoDeps);
      res.status(status).set({ "Content-Type": "text/html" }).send(injected);
    } catch {
      res.status(500).send("Internal Server Error");
    }
  });
}
