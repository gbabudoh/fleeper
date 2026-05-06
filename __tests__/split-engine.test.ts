import { describe, it, expect } from "vitest";
import { calculateFleepSplit } from "../lib/split-engine";

const THREE_POOLS = [
  { id: "spend",  name: "Main Spend",  percentage: 70, color: "#00FFCC" },
  { id: "tax",    name: "Tax Vault",   percentage: 20, color: "#FFB347" },
  { id: "growth", name: "Growth Pool", percentage: 10, color: "#8B5CF6" },
];

describe("calculateFleepSplit", () => {
  it("deducts 2.9% + $0.30 platform fee from gross", () => {
    const result = calculateFleepSplit(50000, THREE_POOLS); // $500.00
    const expectedFee = Math.round(50000 * 0.029) + 30;    // 1450 + 30 = 1480
    expect(result.provision).toBe(expectedFee);
    expect(result.net).toBe(50000 - expectedFee);
  });

  it("splits sum exactly equals net (no cents lost)", () => {
    const amounts = [10000, 50000, 99999, 123456, 1000000];
    for (const gross of amounts) {
      const result = calculateFleepSplit(gross, THREE_POOLS);
      const splitTotal = result.splits.reduce((s, p) => s + p.amountCents, 0);
      expect(splitTotal).toBe(result.net);
    }
  });

  it("distributes cents correctly with largest-remainder rounding", () => {
    // $1.00 → fee = Math.round(100*0.029)+30 = 3+30 = 33 cents, net = 67 cents
    // 70% of 67 = 46.9 → 47, 20% = 13.4 → 13, 10% = 6.7 → 7  (total = 67 ✓)
    const result = calculateFleepSplit(100, THREE_POOLS);
    const total = result.splits.reduce((s, p) => s + p.amountCents, 0);
    expect(total).toBe(result.net);
    // All pool amounts must be non-negative integers
    for (const split of result.splits) {
      expect(split.amountCents).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(split.amountCents)).toBe(true);
    }
  });

  it("respects custom pool percentages", () => {
    const custom = [
      { id: "a", name: "A", percentage: 50, color: "#000" },
      { id: "b", name: "B", percentage: 50, color: "#fff" },
    ];
    const result = calculateFleepSplit(10000, custom);
    const [a, b] = result.splits;
    // With equal 50/50 split the two halves must differ by at most 1 cent
    expect(Math.abs(a.amountCents - b.amountCents)).toBeLessThanOrEqual(1);
    expect(a.amountCents + b.amountCents).toBe(result.net);
  });

  it("throws when pools do not total 100%", () => {
    const bad = [
      { id: "x", name: "X", percentage: 60, color: "#000" },
      { id: "y", name: "Y", percentage: 30, color: "#fff" },
    ]; // only 90%
    expect(() => calculateFleepSplit(10000, bad)).toThrow();
  });

  it("throws when amount is zero or negative", () => {
    expect(() => calculateFleepSplit(0,   THREE_POOLS)).toThrow();
    expect(() => calculateFleepSplit(-50, THREE_POOLS)).toThrow();
  });

  it("throws when amount is too small to cover platform fee", () => {
    // $0.31 gross → fee = Math.round(31*0.029)+30 = 1+30 = 31, net = 0
    expect(() => calculateFleepSplit(31, THREE_POOLS)).toThrow();
  });

  it("returns correct pool metadata on each split entry", () => {
    const result = calculateFleepSplit(50000, THREE_POOLS);
    expect(result.splits).toHaveLength(3);
    expect(result.splits[0].poolId).toBe("spend");
    expect(result.splits[0].percentage).toBe(70);
    expect(result.splits[0].color).toBe("#00FFCC");
  });

  it("handles a single pool at 100%", () => {
    const single = [{ id: "all", name: "All", percentage: 100, color: "#000" }];
    const result = calculateFleepSplit(50000, single);
    expect(result.splits[0].amountCents).toBe(result.net);
  });
});
