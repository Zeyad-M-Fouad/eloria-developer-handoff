import { createGateway, convertToModelMessages, createUIMessageStreamResponse, streamText, toUIMessageStream, type UIMessage } from "ai"

export const maxDuration = 30

const gateway = createGateway()

export async function POST(request: Request) {
  const { messages } = (await request.json()) as { messages: UIMessage[] }
  const result = streamText({
    model: gateway("openai/gpt-5.6-sol"),
    instructions: "You are Codex, a concise and practical programming assistant inside the Eloria project. Help with code, debugging, architecture, and implementation. Do not claim to have changed files or run commands unless the user provides that context. Ask for clarification when requirements are ambiguous.",
    messages: await convertToModelMessages(messages),
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  })
}
