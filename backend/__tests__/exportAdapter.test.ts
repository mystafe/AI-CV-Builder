import { adaptForTemplate } from "../services/exportAdapter"

describe("exportAdapter", () => {
  it("formats period and tenure", () => {
    const cv: any = {
      personal: {},
      summary: "",
      experience: [
        {
          title: "Dev",
          company: "Co",
          startDate: "2020-01",
          endDate: "2021-01",
          bullets: ["x"]
        },
        {
          title: "Now",
          company: "Co2",
          startDate: "2022-01",
          current: true,
          bullets: []
        }
      ],
      education: [],
      skills: [],
      certifications: [],
      projects: [],
      languages: []
    }
    const out = adaptForTemplate(cv as any)
    expect(out.tpl_experience[0].period).toBe("2020-01 → 2021-01")
    expect(typeof out.tpl_experience[0].tenureMonths).toBe("number")
    expect(out.tpl_experience[1].period.startsWith("2022-01 →"))
  })
})
