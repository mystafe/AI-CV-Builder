import request from "supertest"
const app = require("../index.js")

describe("routes contract", () => {
  it("POST /api/ats/check returns expected shape", async () => {
    const res = await request(app)
      .post("/api/ats/check")
      .send({
        cv: {
          personal: {},
          summary: "",
          experience: [],
          education: [],
          skills: [],
          certifications: [],
          projects: [],
          languages: []
        },
        jdKeywords: ["backend"]
      })
      .set("Content-Type", "application/json")
    expect([200, 400]).toContain(res.status)
    if (res.status === 200) {
      expect(res.body).toHaveProperty("score")
      expect(res.body).toHaveProperty("sections_present")
    } else {
      expect(res.body).toHaveProperty("error")
    }
  })
})
