// server.js
import express, { json } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { tunnelQr } from "./tunnel-qr.js";

const app = express();

const FRONTEND_PORT = 5173;
const PROXY_PORT = 5000;

app.use(json());

app.post("/api/log", (req, res) => {
  if (req.body.message) {
    console.log(req.body.message);
  }

  res.sendStatus(200);
});

app.use(
  "/",
  createProxyMiddleware({
    target: `http://localhost:${FRONTEND_PORT}`,
    changeOrigin: true,
    ws: true,
    logLevel: "silent",
  }),
);

app.listen(PROXY_PORT, () => {
  console.log(`Proxy server running on http://localhost:${PROXY_PORT}`);
  console.log(`Forwarding to frontend on http://localhost:${FRONTEND_PORT}`);
});

tunnelQr(PROXY_PORT);
