import React, { useMemo, useState } from "react"
import { createApiClient } from "../lib/api.client"
import { useToast } from "./Toast"

type Props = { cv: any; onClose: () => void; lang?: "tr" | "en" }

export default function CoverLetterModal({ cv, onClose, lang = "tr" }: Props) {
  const [targetRole, setTargetRole] = useState("")
  const [company, setCompany] = useState("")
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const api = useMemo(
    () =>
      createApiClient({
        baseUrl: (process as any)?.env?.REACT_APP_API_BASE || ""
      }),
    []
  )
  const toast = useToast()

  const generate = async () => {
    if (!targetRole.trim()) {
      toast.error(
        lang === "tr" ? "Hedef rol gerekli" : "Target role is required"
      )
      return
    }
    setLoading(true)
    try {
      const requestId = `rq_${Date.now()}`
      const res = await api.coverLetterBuild(
        { cv, targetRole, company: company || undefined, lang },
        requestId
      )
      setText(res.coverLetter)
      toast.success(lang === "tr" ? "Ön yazı hazır" : "Cover letter ready")
    } catch (e: any) {
      toast.error("Failed", e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg w-full max-w-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {lang === "tr" ? "Ön Yazı" : "Cover Letter"}
          </h3>
          <button className="text-sm" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="text-sm font-medium">
              {lang === "tr" ? "Hedef Rol" : "Target Role"} *
            </label>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder={
                lang === "tr"
                  ? "Örn: Backend Engineer"
                  : "e.g., Backend Engineer"
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">
              {lang === "tr" ? "Şirket" : "Company"} (
              {lang === "tr" ? "opsiyonel" : "optional"})
            </label>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder={
                lang === "tr" ? "Örn: Emirates NBD" : "e.g., Emirates NBD"
              }
            />
          </div>
          <div>
            <button
              className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm"
              onClick={generate}
              disabled={loading}
            >
              {loading
                ? lang === "tr"
                  ? "Oluşturuluyor..."
                  : "Generating..."
                : lang === "tr"
                ? "Oluştur"
                : "Generate"}
            </button>
          </div>
          <div>
            <label className="text-sm font-medium">
              {lang === "tr" ? "Ön Yazı Metni" : "Cover Letter Text"}
            </label>
            <textarea
              className="w-full rounded-md border px-3 py-2 text-sm min-h-[200px]"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="mt-2 flex gap-2">
              <button
                className="px-2 py-1 border rounded text-xs"
                onClick={() => navigator.clipboard.writeText(text)}
              >
                {lang === "tr" ? "Kopyala" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
