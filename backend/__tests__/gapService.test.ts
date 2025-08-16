import { analyze } from "../services/gapService"

describe("gapService.analyze", () => {
  it("flags missing contact and weak summary", async () => {
    const cv = {
      personal: { fullName: "Test User", email: "", phone: "", location: "" },
      summary: "",
      experience: [
        {
          title: "Dev",
          company: "Co",
          location: "",
          startDate: "",
          endDate: "",
          current: false,
          bullets: []
        }
      ],
      education: [
        {
          school: "Uni",
          degree: "BSc",
          field: "CS",
          startDate: "",
          endDate: "2017"
        }
      ],
      skills: [{ name: "node.js", level: "" }],
      certifications: [],
      projects: [],
      languages: []
    } as any

    const out = await analyze({
      cv,
      sectorId: "fintech",
      roleId: "backend_engineer",
      seniority: "mid"
    })
    expect(out.missing.personal).toEqual(
      expect.arrayContaining(["email", "phone"])
    )
    expect(out.weak_content.summary).toContain("empty")
    expect(out.priority_order[0]).toBe("personal.email")
    expect(out.sector.roleId).toBe("backend_engineer")
  })
})
