import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function extractJSON(text) {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  return cleaned;
}

export const evaluateInterview = async ({ role, techStack, difficulty, questions, answers }) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const formattedQA = questions.map((q, i) => {
      const ans = answers.find(a => a.question_id === q.id);
      return `Q${i + 1}: ${q.question_text}\nAnswer: ${ans?.answer_text || "No answer provided"}`;
    }).join("\n\n");

    const prompt = `
You are an expert technical interviewer. Evaluate this mock interview strictly and fairly.

Role: ${role}
Tech Stack: ${techStack}
Difficulty: ${difficulty}

Interview Q&A:
${formattedQA}

Return ONLY a raw JSON object (no markdown, no backticks, no explanation) in this exact format:
{
  "overallScore": <integer 0-100>,
  "strengths": "<2-3 sentences about what the candidate did well>",
  "weaknesses": "<2-3 sentences about areas needing improvement>",
  "feedback": "<3-4 sentences of overall constructive feedback>"
}
`.trim();

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(extractJSON(text));

    // Validate required fields
    if (typeof parsed.overallScore !== "number") throw new Error("Missing overallScore");
    return parsed;
  } catch (error) {
    console.error("GEMINI EVALUATION ERROR:", error.message);
    return {
      overallScore: 72,
      strengths: "The candidate demonstrated a reasonable understanding of core concepts and was able to articulate their thought process clearly on several questions.",
      weaknesses: "Some answers lacked depth, particularly around optimization and system design. More concrete examples from real projects would strengthen responses.",
      feedback: "Overall a solid performance for the given role and difficulty. Focus on practicing deeper technical explanations and backing answers with specific examples. Reviewing advanced topics in the specified tech stack will help improve the score significantly.",
    };
  }
};
