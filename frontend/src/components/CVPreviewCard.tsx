import React, { useState } from "react"
import { Copy, ChevronDown } from "lucide-react"

type SectionProps = { title: string; children: React.ReactNode }
function Section({ title, children }: SectionProps) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border border-white/40 rounded-xl bg-white/50 backdrop-blur-md p-3">
      <button
        className="w-full flex items-center justify-between text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-sm font-semibold">{title}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="mt-2 text-sm">{children}</div>}
    </div>
  )
}

type Props = { cv: any }

export default function CVPreviewCard({ cv }: Props) {
  const name = cv?.personal?.fullName || cv?.personalInfo?.name || ""
  const role = cv?.target?.role || ""
  const onCopy = () =>
    navigator.clipboard.writeText(JSON.stringify(cv, null, 2))
  return (
    <div className="relative rounded-2xl border border-white/30 bg-white/60 backdrop-blur-md shadow-md p-4 space-y-3">
      <button
        className="absolute top-2 right-2 p-1 rounded-md border bg-white/70 hover:bg-white transition"
        onClick={onCopy}
        aria-label="Copy JSON"
      >
        <Copy className="w-4 h-4" />
      </button>
      <div>
        <div className="text-xl font-bold">{name}</div>
        {role && <div className="text-sm text-slate-600">{role}</div>}
      </div>
      <div className="space-y-2">
        <Section title="Summary">
          <p>{cv?.summary || ""}</p>
        </Section>
        <Section title="Experience">
          <div className="space-y-2">
            {(cv?.experience || []).map((e: any, i: number) => (
              <div key={i} className="text-sm">
                <div className="font-medium">
                  {e.title} — {e.company}
                </div>
                <div className="text-slate-500 text-xs">
                  {e.location} • {e.startDate} →{" "}
                  {e.current ? "Present" : e.endDate}
                </div>
                <ul className="list-disc pl-5 mt-1">
                  {(e.bullets || [])
                    .slice(0, 5)
                    .map((b: string, bi: number) => (
                      <li key={bi}>{b}</li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
        <Section title="Education">
          <ul className="list-disc pl-5">
            {(cv?.education || []).map((ed: any, i: number) => (
              <li key={i}>
                {ed.degree} — {ed.school} ({ed.startDate} → {ed.endDate})
              </li>
            ))}
          </ul>
        </Section>
        <Section title="Skills">
          <div className="flex flex-wrap gap-2">
            {(cv?.skills || []).map((s: any, i: number) => (
              <span
                key={i}
                className="px-2 py-1 rounded-full border text-xs bg-white/60"
              >
                {s.name || s}
              </span>
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}
