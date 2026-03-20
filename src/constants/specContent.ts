/**
 * Spec content for the rate-limiting spec shown in the VSCode editor.
 * Aligned with plan-spec template and spec-design guidelines.
 * The orchestrator writes the full spec at once — no typewriter effect.
 */

export const SPEC_FILENAME = "spec-2026-03-20-rate-limiting.md";

export const SPEC_LINES: SpecLine[] = [
  { text: "---", style: "frontmatter" },
  { text: "title: API Rate Limiting", style: "frontmatter" },
  { text: "status: draft", style: "frontmatter" },
  { text: "created: 2026-03-20", style: "frontmatter" },
  { text: "---", style: "frontmatter" },
  { text: "", style: "blank" },
  { text: "# API Rate Limiting", style: "h1" },
  { text: "", style: "blank" },
  { text: "## Overview", style: "h2" },
  { text: "", style: "blank" },
  {
    text: "Add per-user, per-endpoint rate limiting across all 14",
    style: "body",
  },
  {
    text: "API route handlers using a sliding window algorithm",
    style: "body",
  },
  {
    text: "backed by the existing Redis dependency. Auth middleware",
    style: "body",
  },
  {
    text: "already extracts user context — hook rate limit checks",
    style: "body",
  },
  { text: "at that layer to avoid per-handler wiring.", style: "body" },
  { text: "", style: "blank" },
  { text: "## Intent", style: "h2" },
  { text: "", style: "blank" },
  {
    text: "A single Express middleware inserted after auth extracts",
    style: "body",
  },
  {
    text: "the user ID and endpoint key, queries Redis for the",
    style: "body",
  },
  {
    text: "current window count, and returns 429 with Retry-After",
    style: "body",
  },
  {
    text: "when the limit is exceeded. Limits are configurable per",
    style: "body",
  },
  {
    text: "endpoint via a route-level decorator or config map.",
    style: "body",
  },
  { text: "", style: "blank" },
  { text: "## Constraints", style: "h2" },
  { text: "", style: "blank" },
  {
    text: "- Must not add latency >5ms p99 to request path",
    style: "list",
  },
  {
    text: "- Redis failure → open (allow request), never block",
    style: "list",
  },
  {
    text: "- No changes to existing route handler signatures",
    style: "list",
  },
  {
    text: "- Rate limit headers on every response (X-RateLimit-*)",
    style: "list",
  },
  { text: "", style: "blank" },
  { text: "## Verification", style: "h2" },
  { text: "", style: "blank" },
  { text: "```yaml", style: "codeblock" },
  { text: "must_haves:", style: "code-key" },
  { text: "  truths:", style: "code-key" },
  {
    text: '    - "429 returned after limit exceeded"',
    style: "code-value",
  },
  {
    text: '    - "Retry-After header present on 429"',
    style: "code-value",
  },
  {
    text: '    - "Redis down → requests pass through"',
    style: "code-value",
  },
  { text: "  artifacts:", style: "code-key" },
  {
    text: '    - "src/middleware/rateLimiter.ts"',
    style: "code-value",
  },
  {
    text: '    - "src/config/rateLimits.ts"',
    style: "code-value",
  },
  { text: "```", style: "codeblock" },
];

export type SpecLineStyle =
  | "frontmatter"
  | "h1"
  | "h2"
  | "body"
  | "blank"
  | "list"
  | "codeblock"
  | "code-key"
  | "code-value";

export type SpecLine = {
  text: string;
  style: SpecLineStyle;
};
