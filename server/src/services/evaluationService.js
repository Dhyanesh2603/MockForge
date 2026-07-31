// NVIDIA NIM API integration (OpenAI-compatible /chat/completions endpoint)
// Docs: https://build.nvidia.com/

const NVIDIA_API_URL =
  "https://integrate.api.nvidia.com/v1/chat/completions";

const CANDIDATE_MODELS = [
  process.env.NVIDIA_MODEL,
  "meta/llama-3.1-8b-instruct",
  "meta/llama-3.1-70b-instruct",
].filter(Boolean);

const extractJson = (text) => {
  if (!text || typeof text !== "string") {
    throw new Error("Empty or invalid AI output string");
  }
  const trimmed = text.trim();

  // Try direct parse first
  try {
    return JSON.parse(trimmed);
  } catch (e) {}

  // Strip markdown code fences
  const clean = trimmed
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(clean);
  } catch (e) {}

  // Extract json object between { and }
  const firstBrace = clean.indexOf("{");
  const lastBrace = clean.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const jsonSub = clean.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(jsonSub);
    } catch (e) {}
  }

  throw new Error(`Failed to parse valid JSON from AI response.`);
};

const callNvidia = async (prompt) => {
  let lastError = null;

  for (const model of CANDIDATE_MODELS) {
    // Skip non-existent or timing out placeholder model strings if present in env
    if (typeof model === "string" && (model.includes("deepseek-v4-flash") || model.includes("llama-3.3-70b"))) {
      continue;
    }

    try {
      const response = await fetch(NVIDIA_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: "You are an AI interviewer evaluator. Respond strictly with valid JSON. Do not include markdown code block syntax or intro text." },
            { role: "user", content: prompt },
          ],
          temperature: 0.2,
          top_p: 1,
          max_tokens: 1536,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`NVIDIA model ${model} failed (${response.status}): ${errText}`);
        lastError = new Error(`NVIDIA API model ${model} error (${response.status}): ${errText}`);
        continue;
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content ?? "";
      if (content.trim()) {
        return content;
      }
    } catch (err) {
      console.warn(`NVIDIA model ${model} fetch exception: ${err.message}`);
      lastError = err;
    }
  }

  throw lastError || new Error("All NVIDIA NIM candidate models failed.");
};

export const evaluateInterview =
  async ({
    role,
    techStack,
    difficulty,
    questions,
    answers,
  }) => {
    try {
      const formattedQuestions =
        questions
          .map((question, index) => {
            const matchingAnswer =
              answers.find(
                (answer) =>
                  String(answer.question_id) ===
                  String(question.id)
              );

            return `
Question ${index + 1}:
${question.question_text}

Candidate Answer:
${
  matchingAnswer?.answer_text ||
  "No answer provided"
}
`;
          })
          .join("\n\n");

      const prompt = `
Evaluate this mock technical interview and provide a comprehensive evaluation report.

Role: ${role}
Tech Stack: ${techStack}
Difficulty: ${difficulty}

Questions and Candidate Answers:
${formattedQuestions}

Return ONLY a valid JSON object in this exact structure:
{
  "overallScore": 85,
  "technicalScore": 82,
  "communicationScore": 88,
  "clarityScore": 85,
  "strengths": "Strong core fundamentals and clear explanation of concepts.",
  "weaknesses": "Could provide more specific code examples and deeper architecture details.",
  "feedback": "Overall impressive performance with solid communication and problem-solving skills."
}
`;

      const rawText = await callNvidia(prompt);
      const evaluation = extractJson(rawText);

      return {
        overallScore: Number(evaluation.overallScore) || 75,
        technicalScore: Number(evaluation.technicalScore) || Number(evaluation.overallScore) || 75,
        communicationScore: Number(evaluation.communicationScore) || Number(evaluation.overallScore) || 75,
        clarityScore: Number(evaluation.clarityScore) || Number(evaluation.overallScore) || 75,
        strengths: evaluation.strengths || "Good understanding of foundational concepts.",
        weaknesses: evaluation.weaknesses || "Could provide deeper technical details and practical examples.",
        feedback: evaluation.feedback || "Solid interview performance overall.",
      };
    } catch (error) {
      console.error(
        "EVALUATION NVIDIA ERROR - FALLBACK TRIGGERED:",
        error
      );

      // FALLBACK MOCK RESPONSE
      return {
        overallScore: 78,
        technicalScore: 75,
        communicationScore: 80,
        clarityScore: 78,
        strengths:
          "Good understanding of core concepts and communication.",
        weaknesses:
          "Could improve advanced optimization and scalability knowledge.",
        feedback:
          "Overall solid interview performance with room for improvement in deeper technical areas.",
      };
    }
  };