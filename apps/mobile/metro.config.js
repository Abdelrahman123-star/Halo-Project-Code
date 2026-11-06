const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const fs = require("fs");
const serveStatic = require("serve-static");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const closetDir = path.join(__dirname, "public", "closet");
const staticHandler = serveStatic(closetDir, { index: ["index.html"] });

config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      const url = req.url || "/";
      const [pathname, search] = url.split("?");

      // Handle root index
      if (pathname === "/" || pathname === "/index.html") {
        res.setHeader("Content-Type", "text/html; charset=UTF-8");
        return fs.createReadStream(path.join(closetDir, "index.html")).pipe(res);
      }

      // Handle /rack
      if (pathname === "/rack") {
        if (search && search.includes("_rsc")) {
          res.setHeader("Content-Type", "text/x-component");
          return fs.createReadStream(path.join(closetDir, "rack.rsc")).pipe(res);
        }
        res.setHeader("Content-Type", "text/html; charset=UTF-8");
        return fs.createReadStream(path.join(closetDir, "rack.html")).pipe(res);
      }

      // Handle /shoes
      if (pathname === "/shoes") {
        if (search && search.includes("_rsc")) {
          res.setHeader("Content-Type", "text/x-component");
          return fs.createReadStream(path.join(closetDir, "shoes.rsc")).pipe(res);
        }
        res.setHeader("Content-Type", "text/html; charset=UTF-8");
        return fs.createReadStream(path.join(closetDir, "shoes.html")).pipe(res);
      }

      // Handle /accessories
      if (pathname === "/accessories") {
        if (search && search.includes("_rsc")) {
          res.setHeader("Content-Type", "text/x-component");
          return fs.createReadStream(path.join(closetDir, "accessories.rsc")).pipe(res);
        }
        res.setHeader("Content-Type", "text/html; charset=UTF-8");
        return fs.createReadStream(path.join(closetDir, "accessories.html")).pipe(res);
      }

      // Serve static assets (images, 3D models, css, js)
      staticHandler(req, res, () => {
        return middleware(req, res, next);
      });
    };
  },
};

module.exports = config;
