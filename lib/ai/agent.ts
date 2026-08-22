import { Content, FunctionCall, FunctionCallingMode } from "@google/generative-ai";
import { getGenerativeModel } from "./model";
import { SYSTEM_PROMPT } from "./systemPrompt";
import { toolDeclarations, executeTool, ToolName } from "./tools";

const MAX_TOOL_ROUNDS = 2;
const MAX_HISTORY_MESSAGES = 10;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function buildContents(messages: ChatMessage[]): Content[] {
  const trimmed = messages.slice(-MAX_HISTORY_MESSAGES);
  return trimmed.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}

export async function* runAgentStream(
  messages: ChatMessage[]
): AsyncGenerator<string> {
  const model = getGenerativeModel();
  const contents = buildContents(messages);
  let yieldedAny = false;

  for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
    const isFinalRound = round === MAX_TOOL_ROUNDS;

    const result = await model.generateContentStream({
      contents,
      systemInstruction: SYSTEM_PROMPT,
      tools: [{ functionDeclarations: toolDeclarations }],
      ...(isFinalRound
        ? {
            toolConfig: {
              functionCallingConfig: { mode: FunctionCallingMode.NONE },
            },
          }
        : {}),
    });

    const functionCalls: FunctionCall[] = [];
    const rawParts: NonNullable<Content["parts"]> = [];

    for await (const chunk of result.stream) {
      const parts = chunk.candidates?.[0]?.content?.parts ?? [];
      for (const part of parts) {
        rawParts.push(part);
        if ("functionCall" in part && part.functionCall) {
          functionCalls.push(part.functionCall);
        } else if ("text" in part && part.text) {
          yieldedAny = true;
          yield part.text;
        }
      }
    }

    // Final round forbids tool calls — the model must answer from gathered data.
    if (isFinalRound || functionCalls.length === 0) break;

    console.log(
      `[ai-agent] round ${round + 1}: ${functionCalls
        .map((fc) => fc.name)
        .join(", ")}`
    );

    contents.push({ role: "model", parts: rawParts });

    const responses = await Promise.all(
      functionCalls.map(async (fc) => {
        const toolName = fc.name as ToolName;
        let response: unknown;
        try {
          response = await executeTool(
            toolName,
            fc.args as Record<string, unknown>
          );
        } catch (err) {
          response = {
            error: `Tool execution failed: ${
              err instanceof Error ? err.message : String(err)
            }`,
          };
        }
        return {
          role: "user" as const,
          parts: [
            {
              functionResponse: {
                name: toolName,
                response: response as object,
              },
            },
          ],
        };
      })
    );
    contents.push(...responses);
  }

  if (!yieldedAny) {
    yield "I couldn't find what you're looking for — could you rephrase your question?";
  }
}
