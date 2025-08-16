import fs from "fs"
import path from "path"
import { z } from "zod"

// Zod schema for taxonomy
const SynonymsSchema = z.record(z.array(z.string().min(1)))
const FollowupTemplatesSchema = z.object({
  impact: z.string().min(3),
  scale: z.string().min(3),
  reliability: z.string().min(3)
})

export const SectorRoleSchema = z.object({
  id: z.string().min(1),
  seniority: z.array(z.enum(["junior", "mid", "senior"])).nonempty(),
  core_skills: z.array(z.string().min(1)).nonempty(),
  nice_to_have: z.array(z.string().min(1)).optional().default([]),
  metrics_templates: z.array(z.string().min(2)).nonempty(),
  keyword_synonyms: SynonymsSchema.optional().default({}),
  followup_templates: FollowupTemplatesSchema
})

export const SectorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  roles: z.array(SectorRoleSchema).nonempty()
})

export const TaxonomySchema = z.object({
  sectors: z.array(SectorSchema).nonempty()
})

export type SectorRole = z.infer<typeof SectorRoleSchema>
export type Sector = z.infer<typeof SectorSchema>
export type SectorTaxonomy = z.infer<typeof TaxonomySchema>

let cached: SectorTaxonomy | null = null

export function loadTaxonomy(): SectorTaxonomy {
  if (cached) return cached
  const file = path.join(
    process.cwd(),
    "backend",
    "data",
    "sector-taxonomy.json"
  )
  const raw = fs.readFileSync(file, "utf8")
  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch (e) {
    throw new Error("sector-taxonomy.json is not valid JSON")
  }
  const parsed = TaxonomySchema.safeParse(json)
  if (!parsed.success) {
    const msg = parsed.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join("; ")
    throw new Error(`Invalid sector taxonomy: ${msg}`)
  }
  cached = parsed.data
  return cached
}

export function resolveRole(
  sectorId: string,
  roleId: string
): SectorRole | null {
  const t = loadTaxonomy()
  const sector = t.sectors.find((s) => s.id === sectorId)
  if (!sector) return null
  return sector.roles.find((r) => r.id === roleId) || null
}

export function expandSynonyms(keywords: string[]): string[] {
  const t = loadTaxonomy()
  const result = new Set<string>()
  for (const kw of keywords) {
    result.add(kw)
    for (const s of t.sectors) {
      for (const r of s.roles) {
        const syns = r.keyword_synonyms[kw]
        if (syns && Array.isArray(syns)) syns.forEach((x) => result.add(x))
      }
    }
  }
  return Array.from(result)
}
