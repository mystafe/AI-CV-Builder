import React from "react"
import ChatBubble from "./ChatBubble"

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
        <div key={i} className="flex">
          <ChatBubble
            type={m.role === "assistant" ? "system" : "user"}
            text={m.text}
            hints={m.hints}
          />
        </div>
      ))}
    </div>
  )
}
