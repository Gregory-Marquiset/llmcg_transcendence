// services/shared/metricsPlugin.js (ESM)
import fp from "fastify-plugin";
import client from "prom-client";

export default fp(async function metricsPlugin(fastify, opts) {
  const serviceName = opts?.serviceName || process.env.SERVICE_NAME || "service";
  const enableBizMetrics = opts?.enableBizMetrics ?? false;
  const registry = client.register;

  if (!fastify.hasDecorator("promInitialized")) {
    client.collectDefaultMetrics({ register: registry });
    fastify.decorate("promInitialized", true);
  }

  const getOrCreateCounter = (cfg) =>
    registry.getSingleMetric(cfg.name) || new client.Counter(cfg);

  const getOrCreateHistogram = (cfg) =>
    registry.getSingleMetric(cfg.name) || new client.Histogram(cfg);

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

  if (enableBizMetrics) {
    const llmcg_loginSuccessTotal = getOrCreateCounter({
      name: "llmcg_login_success_total",
      help: "Total successful logins",
      labelNames: ["service"],
    });

    const llmcg_loginFailureTotal = getOrCreateCounter({
      name: "llmcg_login_failure_total",
      help: "Total failed logins",
      labelNames: ["service"],
    });

    const llmcg_usersCreatedTotal = getOrCreateCounter({
      name: "llmcg_users_created_total",
      help: "Total created users",
      labelNames: ["service"],
    });

    llmcg_loginSuccessTotal.labels(serviceName).inc(0);
    llmcg_loginFailureTotal.labels(serviceName).inc(0);
    llmcg_usersCreatedTotal.labels(serviceName).inc(0);

    if (!fastify.hasDecorator("bizMetrics")) {
      fastify.decorate("bizMetrics", {
        llmcg_loginSuccessTotal,
        llmcg_loginFailureTotal,
        llmcg_usersCreatedTotal,
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
