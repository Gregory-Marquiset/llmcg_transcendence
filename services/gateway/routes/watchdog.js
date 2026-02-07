import fs from "node:fs/promises";

const STATE_PATH = process.env.WATCHDOG_STATE_FILE || "/watchdog/watchdog_state.json";

export async function watchdogRoute(app, options) {
  app.get("/api/v1/watchdog", async (req, reply) => {
    try {
      const raw = await fs.readFile(STATE_PATH, "utf8");
      const data = JSON.parse(raw);

      if (!data || typeof data !== "object") {
        return reply.send({ ok: false, global: "ko", error: "invalid watchdog json" });
      }
      return reply.send(data);
    } catch (e) {
      const msg = e?.code ? `${e.code} ${e.message}` : String(e);
      return reply.send({ ok: false, global: "ko", error: `cannot read ${STATE_PATH}: ${msg}` });
    }
  });
}
