import app from "../artifacts/api-server/dist/index.mjs";

export default function handler(req, res) {
  return app(req, res);
}