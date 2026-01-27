// services/shared/metricsPlugin.js (ESM)
import fp from "fastify-plugin";
import client from "prom-client";

export default fp(async function metricsPlugin(fastify, opts) {
  const serviceName = opts?.serviceName || process.env.SERVICE_NAME || "service";
  const enableBizMetrics = opts?.enableBizMetrics ?? false; // ✅ NEW
  const registry = client.register;

  // évite double init si jamais tu register 2 fois
  if (!fastify.hasDecorator("promInitialized")) {
    client.collectDefaultMetrics({ register: registry });
    fastify.decorate("promInitialized", true);
  }

  // helpers: évite "A metric with the name ... has already been registered."
  const getOrCreateCounter = (cfg) =>
    registry.getSingleMetric(cfg.name) || new client.Counter(cfg);

  const getOrCreateHistogram = (cfg) =>
    registry.getSingleMetric(cfg.name) || new client.Histogram(cfg);

  // HTTP metrics (toujours)
  const httpRequestsTotal = getOrCreateCounter({
    name: "http_requests_total",
    help: "Total HTTP requests",
    labelNames: ["service", "method", "route", "status_code"],
  });

  const httpRequestDuration = getOrCreateHistogram({
    name: "http_request_duration_seconds",
    help: "HTTP request duration in seconds",
    labelNames: ["service", "method", "route", "status_code"],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  });

  // Business metrics (optionnel)
  if (enableBizMetrics) {
    const loginSuccessTotal = getOrCreateCounter({
      name: "login_success_total",
      help: "Total successful logins",
      labelNames: ["service"],
    });

    const loginFailureTotal = getOrCreateCounter({
      name: "login_failure_total",
      help: "Total failed logins",
      labelNames: ["service"],
    });

    const usersCreatedTotal = getOrCreateCounter({
      name: "users_created_total",
      help: "Total created users",
      labelNames: ["service"],
    });

    // créer la série à 0 uniquement pour les services qui en ont besoin
    loginSuccessTotal.labels(serviceName).inc(0);
    loginFailureTotal.labels(serviceName).inc(0);
    usersCreatedTotal.labels(serviceName).inc(0);

    if (!fastify.hasDecorator("bizMetrics")) {
      fastify.decorate("bizMetrics", {
        loginSuccessTotal,
        loginFailureTotal,
        usersCreatedTotal,
        serviceName,
      });
    }
  }

  // timings
  fastify.addHook("onRequest", async (req) => {
    if (req.url === "/metrics") return;
    req._startAt = process.hrtime.bigint();
  });

  fastify.addHook("onResponse", async (req, reply) => {
    if (req.url === "/metrics") return;

    const route =
      (req.routeOptions && req.routeOptions.url) ||
      req.routerPath ||
      "unknown";

    const method = req.method;
    const status = String(reply.statusCode);

    const end = process.hrtime.bigint();
    const seconds = req._startAt ? Number(end - req._startAt) / 1e9 : 0;

    httpRequestsTotal.labels(serviceName, method, route, status).inc();
    httpRequestDuration.labels(serviceName, method, route, status).observe(seconds);
  });

  fastify.get("/metrics", async (_req, reply) => {
    reply.header("Content-Type", registry.contentType);
    return registry.metrics();
  });
});
