import { analyzeATS, AtsCheckInput } from "../services/atsService"

describe("atsService", () => {
  it("computes keyword hits and score", () => {
    const cv: any = {
      personal: { fullName: "A" },
      summary: "Experienced backend engineer skilled in node.js and SQL",
      experience: [
        { title: "Dev", company: "Co", bullets: ["Built REST APIs"] }
      ],
      education: [{ school: "Uni", degree: "BSc" }],
      skills: [
        { name: "node.js", level: "Advanced" },
        { name: "sql", level: "Advanced" }
      ]
    }
    const input = { cv, jdKeywords: ["backend", "node.js", "sql", "api"] }
    const parsed = AtsCheckInput.safeParse(input)
    expect(parsed.success).toBe(true)
    const out = analyzeATS(parsed.data)
    expect(out.keyword_hits.some((h) => h.keyword === "node.js")).toBe(true)
    expect(out.score).toBeGreaterThan(0)
    expect(out.sections_present.summary).toBe(true)
  })
})
