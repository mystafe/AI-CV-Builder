import React, { useMemo, useState } from "react"
import { createApiClient } from "../lib/api.client"
import { useToast } from "./Toast"

type Props = { cv: any; lang?: "tr" | "en" }

export default function ExportPanel({ cv, lang = "tr" }: Props) {
  const [preview, setPreview] = useState<any>(null)
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
      const out = await api.export.adapter({ cv }, requestId)
      setPreview(out)
      toast.success(lang === "tr" ? "Export verisi hazır" : "Export data ready")
    } catch (e: any) {
      toast.error("Export adapter failed", e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <button
          className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm"
          onClick={run}
          disabled={loading}
        >
          {loading
            ? lang === "tr"
              ? "Hazırlanıyor..."
              : "Preparing..."
            : lang === "tr"
            ? "Export Adaptörü"
            : "Export Adapter"}
        </button>
      </div>
      {preview && (
        <pre className="text-xs whitespace-pre-wrap border rounded-md p-2">
          {JSON.stringify(preview, null, 2)}
        </pre>
      )}
    </div>
  )
}
