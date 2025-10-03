import fs from "fs";
import path from "path";

// Caminho do arquivo keys.json na raiz
const filePath = path.join(process.cwd(), "keys.json");

function loadKeys() {
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch {
    return {};
  }
}

function saveKeys(keys) {
  fs.writeFileSync(filePath, JSON.stringify(keys, null, 2));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  // Lê o corpo corretamente seja JSON ou string
  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch (e) {
    return res.status(400).json({ error: "JSON inválido" });
  }

  const key = body?.key;
  const lifetime = Number(body?.lifetime);

  if (!key || !lifetime || isNaN(lifetime) || lifetime < 1) {
    return res.status(400).json({ error: "Envie key e lifetime (segundos > 0)" });
  }

  // Calcula timestamp de expiração (em segundos unix)
  const expiresAt = Math.floor(Date.now() / 1000) + lifetime;

  // Salva no JSON
  const keys = loadKeys();
  keys[key] = { expiresAt };
  saveKeys(keys);

  res.status(200).json({ ok: true, key, expiresAt });
}
