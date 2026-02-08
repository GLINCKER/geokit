import { describe, it, expect } from "vitest";
import { getGrade, calculateScore, buildRecommendations } from "../score.js";
import type { RuleResult } from "../types.js";

describe("Scoring", () => {
  describe("getGrade", () => {
    it("returns A for 90+", () => {
      expect(getGrade(90)).toBe("A");
      expect(getGrade(100)).toBe("A");
    });
    it("returns B for 75-89", () => {
      expect(getGrade(75)).toBe("B");
      expect(getGrade(89)).toBe("B");
    });
    it("returns C for 60-74", () => {
      expect(getGrade(60)).toBe("C");
      expect(getGrade(74)).toBe("C");
    });
    it("returns D for 40-59", () => {
      expect(getGrade(40)).toBe("D");
      expect(getGrade(59)).toBe("D");
    });
    it("returns F for <40", () => {
      expect(getGrade(0)).toBe("F");
      expect(getGrade(39)).toBe("F");
    });
  });

  describe("calculateScore", () => {
    it("calculates 0-100 normalized score", () => {
      const results: RuleResult[] = [
        { id: "R01", name: "T", description: "T", category: "c", status: "pass", score: 10, maxScore: 10, message: "" },
        { id: "R02", name: "T", description: "T", category: "c", status: "fail", score: 0, maxScore: 10, message: "" },
      ];
      expect(calculateScore(results)).toBe(50);
    });

    it("handles all zeros", () => {
      const results: RuleResult[] = [
        { id: "R01", name: "T", description: "T", category: "c", status: "fail", score: 0, maxScore: 10, message: "" },
      ];
      expect(calculateScore(results)).toBe(0);
    });

    it("handles perfect score", () => {
      const results: RuleResult[] = [
        { id: "R01", name: "T", description: "T", category: "c", status: "pass", score: 10, maxScore: 10, message: "" },
        { id: "R02", name: "T", description: "T", category: "c", status: "pass", score: 5, maxScore: 5, message: "" },
      ];
      expect(calculateScore(results)).toBe(100);
    });
  });

  describe("buildRecommendations", () => {
    it("sorts by impact descending", () => {
      const results: RuleResult[] = [
        { id: "R01", name: "T", description: "T", category: "c", status: "fail", score: 0, maxScore: 5, message: "", recommendation: "Fix small thing" },
        { id: "R02", name: "T", description: "T", category: "c", status: "fail", score: 0, maxScore: 10, message: "", recommendation: "Fix big thing" },
      ];
      const recs = buildRecommendations(results);
      expect(recs[0]?.message).toBe("Fix big thing");
      expect(recs[0]?.impact).toBe(10);
    });

    it("excludes passing rules", () => {
      const results: RuleResult[] = [
        { id: "R01", name: "T", description: "T", category: "c", status: "pass", score: 10, maxScore: 10, message: "", recommendation: "Not needed" },
      ];
      const recs = buildRecommendations(results);
      expect(recs).toHaveLength(0);
    });
  });
});
