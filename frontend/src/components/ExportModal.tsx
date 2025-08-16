import React, { useMemo, useState } from "react"
import { createApiClient } from "../lib/api.client"
import { FileText, FileJson, FileArchive } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  cv: any
  lang?: "tr" | "en"
}

export default function ExportModal({
  open,
  onOpenChange,
  cv,
  lang = "tr"
}: Props) {
  const api = useMemo(
    () =>
      createApiClient({
        baseUrl: (process as any)?.env?.REACT_APP_API_BASE || ""
      }),
    []
  )
  const [loading, setLoading] = useState("")
  const note =
    lang === "tr"
      ? "CV’niz güvenli şekilde işlenir, veri depolanmaz."
      : "Your CV will be processed securely, no data stored."

  const downloadBase64 = (filename: string, mime: string, base64: string) => {
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

  const onPdf = async () => {
    setLoading("pdf")
    try {
      // reuse legacy client for render endpoints if needed
      const res = await fetch("/api/render/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv, template: "modern" })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error?.message || "failed")
      downloadBase64(data.filename, data.mime, data.base64)
    } finally {
      setLoading("")
    }
  }
  const onDocx = async () => {
    setLoading("docx")
    try {
      const res = await fetch("/api/render/docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv, template: "modern" })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error?.message || "failed")
      downloadBase64(data.filename, data.mime, data.base64)
    } finally {
      setLoading("")
    }
  }
  const onJson = async () => {
    const blob = new Blob([JSON.stringify(cv, null, 2)], {
      type: "application/json"
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "cv.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg w-full max-w-md p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-lg font-semibold">
                {lang === "tr" ? "CV’yi İndir" : "Download CV"}
              </div>
              <button className="text-sm" onClick={() => onOpenChange(false)}>
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={onPdf}
                disabled={!!loading}
                className="flex items-center gap-2 px-3 py-2 rounded-md border hover:shadow-lg hover:scale-[1.02] transition"
              >
                <FileText className="w-4 h-4" /> PDF{" "}
                {loading === "pdf" && (
                  <span className="animate-pulse text-xs">...</span>
                )}
              </button>
              <button
                onClick={onDocx}
                disabled={!!loading}
                className="flex items-center gap-2 px-3 py-2 rounded-md border hover:shadow-lg hover:scale-[1.02] transition"
              >
                <FileArchive className="w-4 h-4" /> DOCX{" "}
                {loading === "docx" && (
                  <span className="animate-pulse text-xs">...</span>
                )}
              </button>
              <button
                onClick={onJson}
                className="flex items-center gap-2 px-3 py-2 rounded-md border hover:shadow-lg hover:scale-[1.02] transition"
              >
                <FileJson className="w-4 h-4" /> JSON
              </button>
              <div className="text-xs text-slate-500 mt-1">{note}</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
