import fs from "node:fs";
import path from "node:path";

const BACKUP_DIR = process.env.BACKUP_DIR || "/backups";
const META_FILE = path.join(BACKUP_DIR, ".backup_meta.json");

function safeJsonParse(s) {
  try { return JSON.parse(s); } catch { return null; }
}

export async function backupsRoutes(app) {
  app.get("/api/v1/backups", async () => {
    let meta = null;

    if (fs.existsSync(META_FILE)) {
      const raw = fs.readFileSync(META_FILE, "utf8");
      meta = safeJsonParse(raw);
    }

    let files = [];
    try {
      files = fs.readdirSync(BACKUP_DIR)
        .filter((f) => f.startsWith("postgres_") && f.endsWith(".dump.gz"))
        .map((f) => {
          const full = path.join(BACKUP_DIR, f);
          const st = fs.statSync(full);
          return {
            name: f,
            size: st.size,
            mtime: st.mtime.toISOString(),
          };
        })
        .sort((a, b) => (a.mtime < b.mtime ? 1 : -1));
    } catch {
      files = [];
    }

    return {
      ok: true,
      meta,
      latest: files[0] || null,
      count: files.length,
      files: files.slice(0, 10),
    };
  });
}
