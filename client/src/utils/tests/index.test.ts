import { describe, it, expect } from "vitest";
import { buildUrl, formUrlQuery, removeKeysFromQuery } from "../index";

describe("buildUrl", () => {
  it("appends non-empty params to the base url", () => {
    const params = new URLSearchParams({ q: "manila", type: "1" });
    const result = buildUrl("https://api.test/listings", params);

    const url = new URL(result);
    expect(url.origin + url.pathname).toBe("https://api.test/listings");
    expect(url.searchParams.get("q")).toBe("manila");
    expect(url.searchParams.get("type")).toBe("1");
  });

  it("skips params with empty values", () => {
    const params = new URLSearchParams();
    params.append("q", "");
    params.append("type", "2");

    const url = new URL(buildUrl("https://api.test/listings", params));
    expect(url.searchParams.has("q")).toBe(false);
    expect(url.searchParams.get("type")).toBe("2");
  });
});

describe("formUrlQuery", () => {
  it("adds a new key to the current query, anchored at the current pathname", () => {
    const result = formUrlQuery({ params: "type=1", key: "houseType", value: "2" });

    const [path, query] = result.split("?");
    expect(path).toBe(window.location.pathname);
    const parsed = new URLSearchParams(query);
    expect(parsed.get("type")).toBe("1");
    expect(parsed.get("houseType")).toBe("2");
  });

  it("overwrites an existing key", () => {
    const result = formUrlQuery({ params: "type=1", key: "type", value: "2" });
    const parsed = new URLSearchParams(result.split("?")[1]);
    expect(parsed.get("type")).toBe("2");
  });
});

describe("removeKeysFromQuery", () => {
  it("removes the listed keys and keeps the rest", () => {
    const result = removeKeysFromQuery({
      params: "type=1&houseType=2&q=manila",
      keysToRemove: ["houseType", "q"],
    });

    const parsed = new URLSearchParams(result.split("?")[1] ?? "");
    expect(parsed.get("type")).toBe("1");
    expect(parsed.has("houseType")).toBe(false);
    expect(parsed.has("q")).toBe(false);
  });
});
