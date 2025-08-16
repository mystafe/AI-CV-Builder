import React from "react"
import { motion } from "framer-motion"
import { Copy } from "lucide-react"

type Props = {
  type: "user" | "system"
  text: string
  hints?: string[]
  onCopy?: (text: string) => void
}

export default function ChatBubble({ type, text, hints, onCopy }: Props) {
  const isUser = type === "user"
  const base = isUser
    ? "bg-blue-500 text-white rounded-2xl rounded-br-none ml-auto"
    : "bg-gray-200 text-gray-800 rounded-2xl rounded-bl-none"
  const maxw = "max-w-[90%] sm:max-w-[80%]"
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`relative shadow-md px-4 py-2 ${base} ${maxw}`}
    >
      <div className="whitespace-pre-wrap text-sm leading-6">{text}</div>
      {hints && hints.length > 0 && (
        <ul className="mt-2 list-disc pl-5 text-xs opacity-80">
          {hints.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      )}
      {onCopy && (
        <button
          onClick={() => onCopy(text)}
          className={`absolute -top-2 ${
            isUser ? "-left-2" : "-right-2"
          } p-1 rounded-full bg-white/70 hover:bg-white shadow transition-transform hover:scale-105`}
          aria-label="Copy"
        >
          <Copy className="w-4 h-4 text-slate-700" />
        </button>
      )}
    </motion.div>
  )
}
