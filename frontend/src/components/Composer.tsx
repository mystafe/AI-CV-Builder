import React, { useState } from "react"

type Props = {
  questions: Array<{
    id: string
    target: string
    ask: string
    type: "short_text" | "long_text"
    required: boolean
    hints: string[]
  }>
  onSubmit: (answers: Array<{ id: string; value: string }>) => Promise<void>
  disabled?: boolean
  lang?: "tr" | "en"
}

export default function Composer({
  questions,
  onSubmit,
  disabled,
  lang = "en"
}: Props) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const placeholder = (qType: "short_text" | "long_text") => {
    if (lang === "tr")
      return qType === "short_text"
        ? "Yanıtınızı yazın"
        : "Detaylı yanıtınızı yazın"
    return qType === "short_text"
      ? "Type your answer"
      : "Write a detailed answer"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const missing = questions.filter((q) => q.required && !values[q.id])
    if (missing.length > 0) {
      alert(
        lang === "tr"
          ? "Lütfen gerekli alanları doldurun."
          : "Please fill in required fields."
      )
      return
    }
    setSubmitting(true)
    try {
      const payload = questions.map((q) => ({
        id: q.id,
        value: values[q.id] || ""
      }))
      await onSubmit(payload)
      setValues({})
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {questions.map((q) => (
        <div key={q.id} className="space-y-1">
          <label className="text-sm font-medium">
            {q.ask}
            {q.required && <span className="text-red-600">*</span>}
          </label>
          {q.type === "long_text" ? (
            <textarea
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm min-h-[100px]"
              placeholder={placeholder(q.type)}
              value={values[q.id] || ""}
              onChange={(e) =>
                setValues((v) => ({ ...v, [q.id]: e.target.value }))
              }
              disabled={disabled || submitting}
            />
          ) : (
            <input
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
              placeholder={placeholder(q.type)}
              value={values[q.id] || ""}
              onChange={(e) =>
                setValues((v) => ({ ...v, [q.id]: e.target.value }))
              }
              disabled={disabled || submitting}
            />
          )}
        </div>
      ))}
      <div className="pt-2">
        <button
          type="submit"
          disabled={disabled || submitting}
          className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm"
        >
          {submitting
            ? lang === "tr"
              ? "Gönderiliyor..."
              : "Submitting..."
            : lang === "tr"
            ? "Gönder"
            : "Submit"}
        </button>
      </div>
    </form>
  )
}
