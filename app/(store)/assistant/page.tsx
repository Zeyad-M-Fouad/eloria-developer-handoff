"use client"

import { useState } from "react"
import { DefaultChatTransport } from "ai"
import { useChat } from "@ai-sdk/react"
import { ArrowUp, Code2, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

export default function AssistantPage() {
  const [input, setInput] = useState("")
  const { messages, sendMessage, status, stop, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/codex" }),
  })
  const busy = status === "submitted" || status === "streaming"

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!input.trim() || busy) return
    sendMessage({ text: input.trim() })
    setInput("")
  }

  return (
    <main className="mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-4xl flex-col gap-6 px-5 py-10 sm:px-8">
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Code2 /></span>
            <div>
              <CardTitle>Codex assistant</CardTitle>
              <CardDescription>Powered by OpenAI Codex (SOL) through Vercel AI Gateway.</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="flex min-h-[34rem] flex-1 flex-col border-border/70 shadow-sm">
        <CardContent className="flex flex-1 flex-col gap-5 p-4 sm:p-6">
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
            {messages.length === 0 ? (
              <div className="m-auto max-w-md text-center text-muted-foreground">
                <Code2 className="mx-auto mb-3 size-8 text-primary" />
                <p className="font-medium text-foreground">What are you building?</p>
                <p className="mt-1 text-sm">Ask for debugging help, an implementation idea, or a code review.</p>
              </div>
            ) : messages.map((message) => (
              <div key={message.id} className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm ${message.role === "user" ? "self-end bg-primary text-primary-foreground" : "self-start bg-muted text-foreground"}`}>
                {message.parts.map((part, index) => part.type === "text" ? <p key={index} className="whitespace-pre-wrap">{part.text}</p> : null)}
              </div>
            ))}
            {busy && <p className="text-sm text-muted-foreground">Codex is thinking...</p>}
            {error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">Codex could not respond. Check the AI Gateway billing setup and try again.</p>}
          </div>

          <form onSubmit={submit} className="flex items-end gap-2 border-t border-border/70 pt-4">
            <Textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask Codex about your code..." rows={2} disabled={busy} aria-label="Message Codex" />
            {busy ? <Button type="button" variant="outline" size="icon" onClick={() => stop()} aria-label="Stop response"><Square /></Button> : <Button type="submit" size="icon" disabled={!input.trim()} aria-label="Send message"><ArrowUp /></Button>}
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
