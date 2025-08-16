import { FinalizeInput, finalizeCv } from "../services/finalizeService"

// Mock global fetch
const g: any = global

describe("finalizeService", () => {
  beforeEach(() => {
    g.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({ cv: { summary: "ok" }, notes: [] })
            }
          }
        ]
      })
    }))
  })

  it("validates body and returns cv for polish", async () => {
    const input = {
      cv: { personal: {}, summary: "" },
      mode: "polish",
      lang: "en"
    } as any
    const parsed = FinalizeInput.safeParse(input)
    expect(parsed.success).toBe(true)
    const out = await finalizeCv(parsed.data)
    expect(out.cv).toBeTruthy()
    expect(Array.isArray(out.notes)).toBe(true)
  })

  it("switches prompt for rewrite mode", async () => {
    await finalizeCv({
      cv: { personal: {}, summary: "" },
      mode: "rewrite",
      lang: "en"
    } as any)
    expect(fetch).toHaveBeenCalled()
  })
})
