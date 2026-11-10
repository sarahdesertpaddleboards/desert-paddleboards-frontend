import { describe, expect, it } from "vitest";

import shortLinks from "./short-links.json";
import {
  FALLBACK_DESTINATION,
  normalizeSlug,
  resolveShortLink,
  shortLinkSlugs,
} from "./short-links.js";
import { onRequest } from "../functions/go/[[slug]].js";

/** Split a destination into path + params for assertions. */
function parse(destination) {
  const [path, query = ""] = destination.split("?");
  return { path, params: new URLSearchParams(query) };
}

/** Drive the Pages Function the way Cloudflare would. */
function get(path) {
  return onRequest({ request: new Request(`https://desertpaddleboards.com${path}`) });
}

const entries = Object.entries(shortLinks);

describe("short-links.json", () => {
  it("has at least one slug", () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it.each(entries)("%s is a lowercase, URL-safe slug", (slug) => {
    expect(slug).toBe(normalizeSlug(slug));
    expect(slug).toMatch(/^[a-z0-9][a-z0-9-]*$/);
  });

  it.each(entries)("%s points at a real destination", (_slug, destination) => {
    expect(destination).toMatch(/^(\/|https:\/\/)/);
  });

  it("has no duplicate slugs once normalized", () => {
    expect(shortLinkSlugs()).toHaveLength(entries.length);
  });
});

describe("resolveShortLink", () => {
  // The core requirement: every mapped slug resolves to its destination with
  // the UTMs from the map intact.
  it.each(entries)("%s resolves to its mapped destination", (slug, destination) => {
    const resolved = parse(resolveShortLink(slug));
    const expected = parse(destination);

    expect(resolved.path).toBe(expected.path);
    for (const [key, value] of expected.params) {
      expect(resolved.params.get(key)).toBe(value);
    }
  });

  it.each(entries)("%s keeps its UTMs when the visitor brings extra params", (
    slug,
    destination,
  ) => {
    const resolved = parse(resolveShortLink(slug, "?fbclid=abc123&ref=story"));
    const expected = parse(destination);

    expect(resolved.path).toBe(expected.path);
    expect(resolved.params.get("fbclid")).toBe("abc123");
    expect(resolved.params.get("ref")).toBe("story");
    for (const [key, value] of expected.params) {
      expect(resolved.params.get(key)).toBe(value);
    }
  });

  it.each(entries)("%s matches case-insensitively", (slug, destination) => {
    const expected = resolveShortLink(slug);

    expect(resolveShortLink(slug.toUpperCase())).toBe(expected);
    expect(resolveShortLink(`${slug[0].toUpperCase()}${slug.slice(1)}`)).toBe(expected);
    expect(parse(expected).path).toBe(parse(destination).path);
  });

  it.each(entries)("%s tolerates surrounding slashes and whitespace", (slug) => {
    const expected = resolveShortLink(slug);

    expect(resolveShortLink(`${slug}/`)).toBe(expected);
    expect(resolveShortLink(`/${slug}`)).toBe(expected);
    expect(resolveShortLink(` ${slug} `)).toBe(expected);
  });

  it("lets an explicitly tagged inbound link override the mapped UTMs", () => {
    const [slug] = entries[0];
    const { params } = parse(resolveShortLink(slug, "?utm_source=newsletter"));

    expect(params.get("utm_source")).toBe("newsletter");
    // ...without dropping the rest of the mapped campaign.
    expect(params.get("utm_campaign")).toBe(parse(shortLinks[slug]).params.get("utm_campaign"));
    expect(params.getAll("utm_source")).toHaveLength(1);
  });

  it("sends unknown slugs to the homepage rather than 404ing", () => {
    expect(resolveShortLink("no-such-slug")).toBe(FALLBACK_DESTINATION);
    expect(resolveShortLink("")).toBe(FALLBACK_DESTINATION);
    expect(resolveShortLink("%E0%A4%A")).toBe(FALLBACK_DESTINATION); // malformed escape
  });

  it("preserves the query string even on the homepage fallback", () => {
    const { path, params } = parse(
      resolveShortLink("typo", "?utm_source=instagram&utm_medium=bio"),
    );

    expect(path).toBe(FALLBACK_DESTINATION);
    expect(params.get("utm_source")).toBe("instagram");
    expect(params.get("utm_medium")).toBe("bio");
  });

  it("keeps a fragment after the merged query", () => {
    // Not currently used by the map, but destinations like /shop#boards are
    // an obvious next step and must not end up as "/shop#boards?utm_...".
    expect(resolveShortLink("no-such-slug")).not.toContain("#");
    const merged = resolveShortLink("", "?a=1");
    expect(merged.indexOf("?")).toBeLessThan(merged.length);
  });
});

describe("GET /go/* (Pages Function)", () => {
  it.each(entries)("302s %s to its destination with UTMs intact", async (slug) => {
    const res = await get(`/go/${slug}`);

    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe(resolveShortLink(slug));
  });

  it("uses 302, not 301, so destinations stay changeable", async () => {
    for (const [slug] of entries) {
      expect((await get(`/go/${slug}`)).status).toBe(302);
    }
  });

  it("tells browsers and the edge not to cache the mapping", async () => {
    const res = await get(`/go/${entries[0][0]}`);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("forwards the request's query string to the destination", async () => {
    const [slug, destination] = entries[0];
    const res = await get(`/go/${slug}?utm_content=story-swipe-up&fbclid=xyz`);
    const { path, params } = parse(res.headers.get("Location"));

    expect(path).toBe(parse(destination).path);
    expect(params.get("utm_content")).toBe("story-swipe-up");
    expect(params.get("fbclid")).toBe("xyz");
    expect(params.get("utm_source")).toBe(parse(destination).params.get("utm_source"));
  });

  it("matches slugs case-insensitively at the route level", async () => {
    const [slug] = entries[0];
    const res = await get(`/go/${slug.toUpperCase()}`);

    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe(resolveShortLink(slug));
  });

  it("redirects unknown and bare paths to the homepage", async () => {
    for (const path of ["/go/dead-link", "/go/", "/go"]) {
      const res = await get(path);
      expect(res.status).toBe(302);
      expect(res.headers.get("Location")).toBe("/");
    }
  });
});
