import React, { useMemo, useState } from "react"
import { postRenderPdf, postRenderDocx } from "../lib/api"
import { createApiClient } from "../lib/api.client"
import { useToast } from "./Toast"

type Props = {
  cv: any
  target: { role?: string; seniority?: string; sector?: string }
  template: "modern" | "compact" | "classic"
}

function downloadBase64(filename: string, mime: string, base64: string) {
  const blob = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
  const url = URL.createObjectURL(new Blob([blob], { type: mime }))
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function FinalizePanel({ cv, target, template }: Props) {
  const [loading, setLoading] = useState("")
  const [error, setError] = useState("")
  const [mode, setMode] = useState<"polish" | "rewrite">("polish")
  const [preview, setPreview] = useState<any>(null)
  const api = useMemo(
    () =>
      createApiClient({
        baseUrl: (process as any)?.env?.REACT_APP_API_BASE || ""
      }),
    []
  )
  const toast = useToast()

  const dlPdf = async () => {
    try {
      setLoading("pdf")
      const res = await postRenderPdf({ cv, template })
      downloadBase64(res.filename, res.mime, res.base64)
    } catch (e: any) {
      setError(e.message || "PDF failed")
    } finally {
      setLoading("")
    }
  }
  const dlDocx = async () => {
    try {
      setLoading("docx")
      const res = await postRenderDocx({ cv, template })
      downloadBase64(res.filename, res.mime, res.base64)
    } catch (e: any) {
      setError(e.message || "DOCX failed")
    } finally {
      setLoading("")
    }
  }
  const runFinalize = async () => {
    try {
      setLoading("finalize")
      const requestId = `rq_${Date.now()}`
      const res = await api.finalize.post(
        {
          cv,
          mode,
          sectorId: target.sector,
          roleId: target.role,
          seniority: target.seniority,
          lang: "tr"
        },
        requestId
      )
      setPreview(res)
      toast.success(
        "Finalize hazır",
        mode === "polish"
          ? "Hafif rötuşlar uygulandı"
          : "Agresif yeniden yazım tamam"
      )
    } catch (e: any) {
      setError(e.message || "Finalize failed")
      toast.error("Finalize başarısız", e.message)
    } finally {
      setLoading("")
    }
  }

  return (
    <div className="w-full max-w-screen-md mx-auto px-4 sm:px-6 py-3">
      <div className="rounded-2xl border shadow-sm p-4 sm:p-6 bg-white dark:bg-neutral-900">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Finalize</h2>
          {loading && (
            <span className="text-xs text-neutral-500">{loading}...</span>
          )}
        </div>
        {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
        <div className="flex gap-2 mb-3 flex-wrap items-center">
          <div className="flex items-center gap-2 mr-4">
            <label className="text-sm">Mode:</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              className="px-2 py-1 border rounded-md text-sm"
            >
              <option value="polish">polish</option>
              <option value="rewrite">rewrite</option>
            </select>
          </div>
          <button
            className="px-3 py-2 rounded-md bg-emerald-600 text-white text-sm"
            onClick={runFinalize}
            disabled={!!loading}
          >
            Finalize
          </button>
          <button
            className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm"
            onClick={dlPdf}
            disabled={!!loading}
          >
            Download PDF
          </button>
          <button
            className="px-3 py-2 rounded-md border text-sm"
            onClick={dlDocx}
            disabled={!!loading}
          >
            Download DOCX
          </button>
        </div>
        {preview && (
          <div className="mt-4 border rounded-md p-3">
            <div className="text-sm font-medium mb-2">Preview (JSON)</div>
            <pre className="text-xs whitespace-pre-wrap">
              {JSON.stringify(preview, null, 2)}
            </pre>
            <div className="mt-2">
              <button
                className="px-3 py-2 rounded-md bg-indigo-600 text-white text-sm"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("finalize.apply", { detail: preview })
                  )
                }
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="h-16" />
      <div className="fixed bottom-0 inset-x-0 md:hidden bg-white/90 dark:bg-neutral-900/90 border-t border-neutral-200 dark:border-neutral-800 px-4 py-3 flex items-center justify-end gap-3">
        <button
          className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm"
          onClick={dlPdf}
          disabled={!!loading}
        >
          Download PDF
        </button>
      </div>
    </div>
  )
}
