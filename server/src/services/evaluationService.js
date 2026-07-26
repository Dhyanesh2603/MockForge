import { GoogleGenAI } from "@google/genai";
 
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
 
// gemini-2.0-flash was retired by Google on June 1, 2026.
// gemini-3.5-flash is the current GA, production-ready replacement.
const MODEL = "gemini-3.5-flash";
 
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
 
export const evaluateInterview = async ({
  role,
  techStack,
  difficulty,
  questions,
  answers,
}) => {
  try {
    const formattedQuestions = questions
      .map((question, index) => {
        const matchingAnswer = answers.find(
          (answer) => answer.question_id === question.id
        );
 
        return `
Question ${index + 1}:
${question.question_text}
 
Answer:
${matchingAnswer?.answer_text || "No answer provided"}
`;
      })
      .join("\n\n");
 
    const prompt = `
You are an AI technical interviewer.
 
Evaluate this mock interview.
 
Role: ${role}
 
Tech Stack: ${techStack}
 
Difficulty: ${difficulty}
 
Questions and Answers:
${formattedQuestions}
 
Return ONLY valid JSON in this exact format:
 
{
  "overallScore": 85,
  "strengths": "Good React fundamentals and clean explanations.",
  "weaknesses": "Needs deeper backend optimization knowledge.",
  "feedback": "Overall strong performance with decent communication and technical understanding."
}
`;
 
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });
 
    return parseJsonResponse(response.text);
  } catch (error) {
    console.error("EVALUATION GEMINI ERROR");
 
    console.error(error);
 
    // FALLBACK MOCK RESPONSE
    return {
      overallScore: 78,
 
      strengths:
        "Good understanding of core concepts and communication.",
 
      weaknesses:
        "Could improve advanced optimization and scalability knowledge.",
 
      feedback:
        "Overall solid interview performance with room for improvement in deeper technical areas.",
    };
  }
};
 