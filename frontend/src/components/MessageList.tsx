import React from "react"
import { Card } from "./ui"

export type Msg = {
  role: "assistant" | "user"
  text: string
  hints?: string[]
}

type Props = {
  messages: Msg[]
}

export default function MessageList({ messages }: Props) {
  return (
    <div className="space-y-3">
      {messages.map((m, i) => (
        <Card
          key={i}
          className={`p-3 ${
            m.role === "assistant" ? "" : "bg-blue-50 dark:bg-blue-950/20"
          }`}
        >
          <div className="whitespace-pre-wrap text-sm leading-6">{m.text}</div>
          {m.hints && m.hints.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-xs text-slate-500 dark:text-slate-400">
              {m.hints.map((h, idx) => (
                <li key={idx}>{h}</li>
              ))}
            </ul>
          )}
        </Card>
      ))}
    </div>
  )
}
