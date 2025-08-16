import { z } from "zod"

export const CvPersonalSchema = z.object({
  fullName: z.string().optional().default(""),
  email: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  location: z.string().optional().default("")
})

export const CvExperienceSchema = z.object({
  title: z.string().optional().default(""),
  company: z.string().optional().default(""),
  location: z.string().optional().default(""),
  startDate: z.string().optional().default(""),
  endDate: z.string().optional().default(""),
  current: z.boolean().optional().default(false),
  bullets: z.array(z.string()).optional().default([])
})

export const CvEducationSchema = z.object({
  school: z.string().optional().default(""),
  degree: z.string().optional().default(""),
  field: z.string().optional().default(""),
  startDate: z.string().optional().default(""),
  endDate: z.string().optional().default("")
})

export const CvSkillSchema = z.object({
  name: z.string().optional().default(""),
  level: z.string().optional().default("")
})

export const CvCertificationSchema = z.object({
  name: z.string().optional().default(""),
  issuer: z.string().optional().default(""),
  year: z.string().optional().default("")
})

export const CvProjectSchema = z.object({
  name: z.string().optional().default(""),
  summary: z.string().optional().default(""),
  tech: z.array(z.string()).optional().default([])
})

export const CvLanguageSchema = z.object({
  name: z.string().optional().default(""),
  level: z.string().optional().default("")
})

export const UnifiedCvSchema = z.object({
  personal: CvPersonalSchema.default({}),
  summary: z.string().optional().default(""),
  experience: z.array(CvExperienceSchema).optional().default([]),
  education: z.array(CvEducationSchema).optional().default([]),
  skills: z.array(CvSkillSchema).optional().default([]),
  certifications: z.array(CvCertificationSchema).optional().default([]),
  projects: z.array(CvProjectSchema).optional().default([]),
  languages: z.array(CvLanguageSchema).optional().default([])
})

export type Cv = z.infer<typeof UnifiedCvSchema>
