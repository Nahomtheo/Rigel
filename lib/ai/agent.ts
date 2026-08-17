import { Content, FunctionCall } from "@google/generative-ai";
import { getGenerativeModel } from "./model";
import { SYSTEM_PROMPT } from "./systemPrompt";
import { toolDeclarations, executeTool, ToolName } from "./tools";

const MAX_TOOL_ROUNDS = 5;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function runAgent(messages: ChatMessage[]): Promise<string> {
  const model = getGenerativeModel();

  const contents: Content[] = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
 

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const result = await model.generateContent({
      contents,
      systemInstruction: SYSTEM_PROMPT,
      tools: [{ functionDeclarations: toolDeclarations }],
    });

    const candidate = result.response.candidates?.[0];
     console.log(candidate?.content,": this are the candidate")

    if (!candidate) {
      return "I'm sorry, I couldn't generate a response. Please try again.";
    }

    const functionCalls = candidate.content.parts.filter(
      (p): p is { functionCall: FunctionCall } & { text?: never } /* this express type of p */ =>
        "functionCall" in p && p.functionCall != null// this is the main condition
    );

    // No tool call → Gemini has the final answer
    if (functionCalls.length === 0) {
      const textPart = candidate.content.parts.find((p) => "text" in p);

      return textPart && "text" in textPart
        ? (textPart.text ?? "I'm not sure how to help with that.")
        : "I'm not sure how to help with that.";
    }

    // Add Gemini's tool call to conversation
    contents.push(candidate.content);

    // Execute every requested tool
    for (const fc of functionCalls) {
      const toolName = fc.functionCall.name as ToolName;
      const args = fc.functionCall.args as Record<string, unknown>;

      let response: unknown;

      try {
        response = await executeTool(toolName, args);
      } catch (err) {
        response = {
          error: `Tool execution failed: ${
            err instanceof Error ? err.message : String(err)
          }`,
        };
      }

      // Send the tool result back to Gemini
      contents.push({
        role: "user",
        parts: [
          {
            functionResponse: {
              name: toolName,
              response: response as object,
            },
          },
        ],
      });
    }
  }

  return "I looked into that but couldn't find a final answer. Could you try rephrasing your question?";
}