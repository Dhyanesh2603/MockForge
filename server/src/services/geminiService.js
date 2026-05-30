import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Strip ```json ... ``` or ``` ... ``` fences that Gemini wraps JSON in
function extractJSON(text) {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  return cleaned;
}

export const generateInterviewQuestions = async ({ role, techStack, difficulty }) => {
  try {
    const prompt = `
You are a technical interviewer. Generate exactly 10 interview questions for the following:

Role: ${role}
Tech Stack: ${techStack}
Difficulty: ${difficulty}

STRICT RULES:
- Return ONLY a raw JSON array of 10 strings
- No markdown, no backticks, no explanation, no numbering
- Just the raw JSON array starting with [ and ending with ]
- Each element is a question string

Example output:
["Question 1?","Question 2?","Question 3?","Question 4?","Question 5?","Question 6?","Question 7?","Question 8?","Question 9?","Question 10?"]
`.trim();

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(extractJSON(text));

    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Invalid questions array");
    return parsed;
  } catch (error) {
    console.error("GEMINI QUESTION GEN ERROR:", error.message);
    // Fallback: role-generic questions instead of React-specific ones
    return [
      `Explain the core responsibilities of a ${role}.`,
      `What is your approach to debugging complex issues in ${techStack}?`,
      `How do you ensure code quality and maintainability in ${techStack} projects?`,
      `Describe a challenging problem you solved using ${techStack}.`,
      `How do you handle performance optimization in ${techStack}?`,
      `Explain the architecture you'd choose for a scalable ${role} project.`,
      `What testing strategies do you use when working with ${techStack}?`,
      `How do you stay updated with changes in ${techStack}?`,
      `Describe your experience with version control and collaboration in ${role} projects.`,
      `What are common security concerns for a ${role} and how do you address them?`,
    ];
  }
};
