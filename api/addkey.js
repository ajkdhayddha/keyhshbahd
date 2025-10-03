import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "keys.json");

function loadKeys() {
  try { return JSON.parse(fs.readFileSync(filePath)); } catch { return {}; }
}

function saveKeys(keys) {
  fs.writeFileSync(filePath, JSON.stringify(keys, null, 2));
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });
  let body = req.body;
  if (typeof body === "string") body = JSON.parse(body);

  const { key, lifetime } = body; // lifetime em segundos (ex: 7200 para 2 horas)
  if (!key || !lifetime) return res.status(400).json({ error: "Faltando dados" });

  const expiresAt = Math.floor(Date.now() / 1000) + Number(lifetime);

  const keys = loadKeys();
  keys[key] = { expiresAt };
  saveKeys(keys);

  res.status(200).json({ ok: true, key, expiresAt });
}
