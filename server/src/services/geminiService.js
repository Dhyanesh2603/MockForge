import { GoogleGenAI } from "@google/genai";
 
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
 
// gemini-2.0-flash was retired by Google on June 1, 2026.
// gemini-3.5-flash is the current GA, production-ready replacement.
const MODEL = "gemini-3.5-flash";
 
const mockQuestions = [
  "Explain React useEffect hook.",
  "What is the Virtual DOM?",
  "Difference between state and props?",
  "Explain JavaScript closures.",
  "What is REST API?",
  "Explain async/await in JavaScript.",
  "What is middleware in Express.js?",
  "Difference between SQL and NoSQL?",
  "What is authentication?",
  "Explain React component lifecycle.",
];
 
// Defensive JSON parsing: even with responseMimeType set to JSON,
// this strips any stray ```json fences before parsing.
function parseJsonResponse(text) {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
 
  return JSON.parse(cleaned);
}
 
export const generateInterviewQuestions = async ({
  role,
  techStack,
  difficulty,
}) => {
  try {
    const prompt = `
Generate 10 interview questions for:
 
Role: ${role}
 
Tech Stack: ${techStack}
 
Difficulty: ${difficulty}
 
Rules:
- Return ONLY a valid JSON array
- No markdown
- No explanations
`;
 
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });
 
    const questions = parseJsonResponse(response.text);
 
    return questions;
  } catch (error) {
    console.error("GEMINI ERROR - USING MOCK QUESTIONS");
 
    console.error(error);
 
    return mockQuestions;
  }
};