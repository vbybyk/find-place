import { describe, it, expect } from "vitest";
import { formatGeoCities } from "../index";

const geoname = (over: Record<string, unknown> = {}) => ({
  name: "City",
  geonameId: 1,
  adminName1: "Region",
  population: 100,
  fclName: "city, village,...",
  ...over,
});

describe("formatGeoCities", () => {
  it("maps geonames to { label, id, adminName1 }", () => {
    const result = formatGeoCities({
      geonames: [geoname({ name: "Manila", geonameId: 42, adminName1: "Metro Manila" })],
    });

    expect(result).toEqual([{ label: "Manila", id: 42, adminName1: "Metro Manila" }]);
  });

  it("drops entries with population 0 or a non-city fclName", () => {
    const result = formatGeoCities({
      geonames: [
        geoname({ name: "Real", population: 500 }),
        geoname({ name: "ZeroPop", population: 0 }),
        geoname({ name: "NotACity", fclName: "stream, lake,..." }),
      ],
    });

    expect(result.map((c: { label: string }) => c.label)).toEqual(["Real"]);
  });

  it("sorts by population descending", () => {
    const result = formatGeoCities({
      geonames: [
        geoname({ name: "Small", population: 10 }),
        geoname({ name: "Big", population: 900 }),
        geoname({ name: "Mid", population: 100 }),
      ],
    });

    expect(result.map((c: { label: string }) => c.label)).toEqual(["Big", "Mid", "Small"]);
  });

  it("returns undefined when data has no geonames", () => {
    expect(formatGeoCities({})).toBeUndefined();
    expect(formatGeoCities(null)).toBeUndefined();
  });
});
