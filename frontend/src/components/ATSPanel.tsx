import React, { useMemo, useState } from "react"
import { createApiClient } from "../lib/api.client"
import { useToast } from "./Toast"

type Props = { cv: any; lang?: "tr" | "en" }

export default function ATSPanel({ cv, lang = "tr" }: Props) {
  const [kw, setKw] = useState(
    "backend,node.js,sql,api,banking,microservices,docker,kubernetes"
  )
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const api = useMemo(
    () =>
      createApiClient({
        baseUrl: (process as any)?.env?.REACT_APP_API_BASE || ""
      }),
    []
  )
  const toast = useToast()

  const run = async () => {
    setLoading(true)
    try {
      const requestId = `rq_${Date.now()}`
      const jdKeywords = kw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
      const out = await api.ats.check({ cv, jdKeywords }, requestId)
      setResult(out)
      toast.success(lang === "tr" ? "ATS analizi hazır" : "ATS analysis ready")
    } catch (e: any) {
      toast.error("ATS failed", e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium">
          {lang === "tr" ? "Anahtar Kelimeler" : "Keywords"}
        </label>
        <input
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={kw}
          onChange={(e) => setKw(e.target.value)}
          placeholder={lang === "tr" ? "virgülle ayırın" : "comma-separated"}
        />
      </div>
      <div>
        <button
          className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm"
          onClick={run}
          disabled={loading}
        >
          {loading
            ? lang === "tr"
              ? "Analiz ediliyor..."
              : "Analyzing..."
            : lang === "tr"
            ? "Analiz Et"
            : "Analyze"}
        </button>
      </div>
      {result && (
        <div className="space-y-2">
          <div className="text-sm">
            {lang === "tr" ? "Skor" : "Score"}:{" "}
            <span className="font-semibold">{result.score}</span>
          </div>
          <div>
            <div className="text-sm font-medium">
              {lang === "tr" ? "Uyarılar" : "Warnings"}
            </div>
            <ul className="list-disc pl-5 text-sm">
              {result.warnings.map((w: string, i: number) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-sm font-medium">
              {lang === "tr" ? "Anahtar Kelime Eşleşmeleri" : "Keyword Hits"}
            </div>
            <ul className="list-disc pl-5 text-sm">
              {result.keyword_hits.map((h: any, i: number) => (
                <li key={i}>
                  <span className="font-semibold">{h.keyword}</span>:{" "}
                  {h.found_in.join(", ")}
                </li>
              ))}
            </ul>
          </div>
          <div className="text-xs text-slate-500">{result.scoring_notes}</div>
        </div>
      )}
    </div>
  )
}
