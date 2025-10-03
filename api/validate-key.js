import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "keys.json");

function loadKeys() {
  try { return JSON.parse(fs.readFileSync(filePath)); } catch { return {}; }
}

function saveKeys(keys) {
  fs.writeFileSync(filePath, JSON.stringify(keys, null, 2));
}

function purgeExpired(keys) {
  const now = Math.floor(Date.now() / 1000);
  let changed = false;
  for (const key in keys) {
    if (keys[key].expiresAt > 0 && now > keys[key].expiresAt) {
      delete keys[key];
      changed = true;
    }
  }
  if (changed) saveKeys(keys);
}

export default function handler(req, res) {
  const { key } = req.query;
  if (!key) return res.status(400).json({ status: "error", msg: "Key ausente" });
  const keys = loadKeys();
  purgeExpired(keys);
  const info = keys[key];
  if (!info) return res.status(401).json({ status: "invalid" });
  const now = Math.floor(Date.now() / 1000);
  if (info.expiresAt > 0 && now > info.expiresAt) {
    delete keys[key];
    saveKeys(keys);
    return res.status(401).json({ status: "expired" });
  }
  return res.status(200).json({ status: "ok", expires: info.expiresAt });
}
