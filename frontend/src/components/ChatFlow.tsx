import React, { useEffect, useMemo, useState } from "react"
import MessageList, { Msg } from "./MessageList"
import Composer from "./Composer"
import { createApiClient } from "../lib/api.client"
import { useToast } from "./Toast"

type Question = {
  id: string
  target: string
  ask: string
  type: "short_text" | "long_text"
  required: boolean
  hints: string[]
}

type Props = {
  cv: any
  sectorId?: string
  roleId?: string
  seniority?: string
}

export default function ChatFlow({ cv, sectorId, roleId, seniority }: Props) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [messages, setMessages] = useState<Msg[]>([])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()

  const api = useMemo(
    () =>
      createApiClient({
        baseUrl: (process as any)?.env?.REACT_APP_API_BASE || ""
      }),
    []
  )
  const lang: "tr" | "en" = useMemo(() => {
    const s = (cv?.summary || "").toLowerCase()
    return / [ığüşöç]/.test(s) || / türk|istanbul|ankara/.test(s) ? "tr" : "en"
  }, [cv])

  useEffect(() => {
    let cancelled = false
    const start = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/followup/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cv, sectorId, roleId, seniority })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error?.message || "start_failed")
        if (cancelled) return
        setSessionId(data.sessionId)
        setQuestions(data.nextQuestions || [])
        const intro: Msg = {
          role: "assistant",
          text:
            lang === "tr"
              ? "CV’nizi geliştirmek için bazı kısa sorular soracağım."
              : "I will ask a few brief questions to improve your CV."
        }
        setMessages([intro, ...toAssistantMsgs(data.nextQuestions)])
      } catch (e: any) {
        setError(e.message || "start_failed")
        toast.error("Follow-up start failed", e.message)
      } finally {
        setLoading(false)
      }
    }
    start()
    return () => {
      cancelled = true
    }
  }, [cv, sectorId, roleId, seniority])

  const toAssistantMsgs = (qs: Question[]): Msg[] =>
    qs.map((q) => ({ role: "assistant", text: q.ask, hints: q.hints }))

  const onSubmit = async (answers: Array<{ id: string; value: string }>) => {
    if (!sessionId) return
    setLoading(true)
    setError(null)
    try {
      // push user message bundle
      setMessages((m) => [
        ...m,
        { role: "user", text: answers.map((a) => `• ${a.value}`).join("\n") }
      ])
      const requestId = `rq_${Date.now()}`
      const res = await fetch(`/api/followup/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId
        },
        body: JSON.stringify({ sessionId, answers })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error?.message || "answer_failed")
      setQuestions(data.nextQuestions || [])
      if (data.done) setDone(true)
      else setMessages((m) => [...m, ...toAssistantMsgs(data.nextQuestions)])
    } catch (e: any) {
      setError(e.message || "answer_failed")
      toast.error("Follow-up answer failed", e.message)
    } finally {
      setLoading(false)
    }
  }

  const onDownload = () => {
    // hook to export routes in app (left for integration with existing export)
    alert(
      lang === "tr" ? "İndirme akışı bağlanacak." : "Download flow to be wired."
    )
  }

  const onContinuePolish = () => {
    alert(
      lang === "tr"
        ? "Finalize modu seçimi eklenecek."
        : "Finalize mode selection to be added."
    )
  }

  return (
    <div className="space-y-4">
      {error && <div className="text-sm text-red-600">{error}</div>}
      <MessageList messages={messages} />
      {!done ? (
        <Composer
          questions={questions}
          onSubmit={onSubmit}
          disabled={loading}
          lang={lang}
        />
      ) : (
        <div className="flex gap-2">
          <button
            className="px-3 py-2 rounded-md border text-sm"
            onClick={onDownload}
          >
            {lang === "tr" ? "Bu haliyle indir" : "Download as is"}
          </button>
          <button
            className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm"
            onClick={onContinuePolish}
          >
            {lang === "tr"
              ? "CV’mi geliştirmeye devam et"
              : "Continue improving my CV"}
          </button>
        </div>
      )}
    </div>
  )
}
