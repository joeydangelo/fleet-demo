/**
 * Fleet YAML content for the rate-limiting decomposition shown in the video.
 * Aligned with fleet-yaml template, task-splitting guidelines, and
 * decompose-work shortcut conventions.
 */

export const YAML_FILENAME = "fleet.yaml";

export const YAML_LINES: YamlLine[] = [
  { text: "# .fleet/fleet.yaml", style: "comment" },
  { text: "", style: "blank" },
  { text: "target: feat/rate-limiting", style: "key-value" },
  { text: "model: sonnet", style: "key-value" },
  { text: "spec: .fleet/specs/spec-2026-03-20-rate-limiting.md", style: "key-value" },
  { text: "", style: "blank" },
  { text: "tasks:", style: "key" },
  { text: "  middleware:", style: "key" },
  { text: "    focus:", style: "key" },
  { text: "      - src/middleware/rateLimiter.ts", style: "list-item" },
  { text: "      - src/middleware/rateLimiter.test.ts", style: "list-item" },
  { text: "      - src/types/rateLimit.ts", style: "list-item" },
  { text: "    prompt: |", style: "key-value" },
  {
    text: "      The rate limiter middleware enforces per-user, per-endpoint",
    style: "prompt-body",
  },
  {
    text: "      limits using a sliding window algorithm backed by Redis.",
    style: "prompt-body",
  },
  { text: "", style: "blank" },
  {
    text: "      Create src/types/rateLimit.ts with RateLimitConfig and",
    style: "prompt-body",
  },
  {
    text: "      RateLimitResult types — the config task imports these.",
    style: "prompt-body",
  },
  {
    text: "      Build src/middleware/rateLimiter.ts: extract user ID from",
    style: "prompt-body",
  },
  {
    text: "      auth context, compute Redis key from user + endpoint,",
    style: "prompt-body",
  },
  {
    text: "      query current window count, return 429 with Retry-After",
    style: "prompt-body",
  },
  {
    text: "      when exceeded. Set X-RateLimit-Limit, X-RateLimit-Remaining,",
    style: "prompt-body",
  },
  {
    text: "      X-RateLimit-Reset on every response. On Redis failure,",
    style: "prompt-body",
  },
  { text: "      allow the request through.", style: "prompt-body" },
  { text: "", style: "blank" },
  {
    text: "      Acceptance: 429 after limit exceeded, Retry-After present,",
    style: "prompt-body",
  },
  {
    text: "      Redis failure → requests pass, headers on all responses.",
    style: "prompt-body",
  },
  { text: "", style: "blank" },
  { text: "  config:", style: "key" },
  { text: "    focus:", style: "key" },
  { text: "      - src/config/rateLimits.ts", style: "list-item" },
  { text: "      - src/config/rateLimits.test.ts", style: "list-item" },
  { text: "      - src/middleware/index.ts", style: "list-item" },
  { text: "    depends_on: middleware", style: "key-value" },
  { text: "    prompt: |", style: "key-value" },
  {
    text: "      The rate limit config defines per-endpoint limits and",
    style: "prompt-body",
  },
  {
    text: "      registers the middleware in the Express pipeline.",
    style: "prompt-body",
  },
  { text: "", style: "blank" },
  {
    text: "      Import RateLimitConfig from src/types/rateLimit.ts. Define",
    style: "prompt-body",
  },
  {
    text: "      default limits (100 req/min) and per-endpoint overrides in",
    style: "prompt-body",
  },
  {
    text: "      src/config/rateLimits.ts. Register the rate limiter after",
    style: "prompt-body",
  },
  { text: "      auth middleware in src/middleware/index.ts.", style: "prompt-body" },
  { text: "", style: "blank" },
  {
    text: "      Acceptance: config exports a typed limit map, middleware",
    style: "prompt-body",
  },
  {
    text: "      registered after auth, default limits apply to unlisted",
    style: "prompt-body",
  },
  { text: "      endpoints.", style: "prompt-body" },
  { text: "", style: "blank" },
  { text: "  api:", style: "key" },
  { text: "    focus:", style: "key" },
  { text: "      - src/routes/rateLimitStatus.ts", style: "list-item" },
  {
    text: "      - src/routes/rateLimitStatus.test.ts",
    style: "list-item",
  },
  { text: "    depends_on: middleware", style: "key-value" },
  { text: "    prompt: |", style: "key-value" },
  {
    text: "      The status endpoint lets clients check their current",
    style: "prompt-body",
  },
  {
    text: "      rate limit usage before hitting a 429.",
    style: "prompt-body",
  },
  { text: "", style: "blank" },
  {
    text: "      Import RateLimitResult from src/types/rateLimit.ts.",
    style: "prompt-body",
  },
  {
    text: "      Build GET /v1/rate-limit/status — returns current",
    style: "prompt-body",
  },
  {
    text: "      limit, remaining, and reset time per endpoint for the",
    style: "prompt-body",
  },
  {
    text: "      authenticated user. Use checkLimit() in read-only mode",
    style: "prompt-body",
  },
  { text: "      (query without incrementing the counter).", style: "prompt-body" },
  { text: "", style: "blank" },
  {
    text: "      Acceptance: returns 200 with limit/remaining/reset,",
    style: "prompt-body",
  },
  {
    text: "      401 without auth, response matches X-RateLimit-* headers.",
    style: "prompt-body",
  },
];

export type YamlLineStyle =
  | "comment"
  | "key"
  | "key-value"
  | "list-item"
  | "prompt-body"
  | "blank";

export type YamlLine = {
  text: string;
  style: YamlLineStyle;
};
