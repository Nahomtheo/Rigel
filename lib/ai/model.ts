import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export const MODEL_NAME = "gemini-3.6-flash";

export function getGenerativeModel() {
  return genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      maxOutputTokens: 2048,
      temperature: 0.7,
      candidateCount: 1,
    },
  });
}
