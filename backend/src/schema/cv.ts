/**
 * CV schema definition and associated types.
 */
import { z } from "zod";

/** YYYY-MM formatted date or null when unknown */
const DateSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Invalid date format")
  .nullable();

/** Optional impact metric for bullet points */
export const ImpactMetricSchema = z.object({
  type: z.enum(["%", "abs", "time", "money"]),
  value: z.number(),
  baseline: z.string().optional(),
});

/** Single sentence bullet starting with a verb */
export const BulletSchema = z.object({
  text: z
    .string()
    .min(1)
    .refine((v) => /^[A-Za-z]/.test(v.trim()), {
      message: "Bullet must start with a letter",
    })
    .refine((v) => v.trim().endsWith("."), {
      message: "Bullet must end with a period",
    })
    .refine((v) => v.replace(/[^.]/g, "").length <= 1, {
      message: "Bullet must be a single sentence",
    }),
  impactMetric: ImpactMetricSchema.optional(),
});

/** Experience entry */
export const ExperienceSchema = z.object({
  role: z.string(),
  company: z.string(),
  location: z.string().optional(),
  startDate: DateSchema,
  endDate: DateSchema,
  bullets: z.array(BulletSchema),
});

/** Education entry */
export const EducationSchema = z.object({
  school: z.string(),
  degree: z.string(),
  field: z.string().optional(),
  startDate: DateSchema,
  endDate: DateSchema,
});

/** Skills grouped by importance */
export const SkillsSchema = z.object({
  primary: z.array(z.string()),
  secondary: z.array(z.string()),
  tools: z.array(z.string()),
});

/** Normalized external links */
export const LinkSchema = z.object({
  type: z.enum(["github", "portfolio", "linkedin", "other"]),
  url: z.string().url(),
});

/** Main CV schema */
export const CVSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  headline: z.string().optional(),
  summary: z.string().optional(),
  location: z.string().optional(),
  links: z.array(LinkSchema).default([]),
  skills: SkillsSchema,
  experience: z.array(ExperienceSchema),
  education: z.array(EducationSchema),
});

export type CV = z.infer<typeof CVSchema>;
