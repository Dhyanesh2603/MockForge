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
      // Count how many questions actually have a real answer
      let answeredCount = 0;
      const formattedQuestions =
        questions
          .map((question, index) => {
            const matchingAnswer =
              answers.find(
                (answer) =>
                  String(answer.question_id) ===
                  String(question.id)
              );

            const answerText = matchingAnswer?.answer_text?.trim();
            if (answerText && answerText.length > 0) {
              answeredCount++;
            }

            return `
Question ${index + 1}:
${question.question_text}

Candidate Answer:
${answerText || "[SKIPPED - No answer provided]"}
`;
          })
          .join("\n\n");

      // If the candidate answered ZERO questions, return 0 score immediately
      if (answeredCount === 0) {
        return {
          overallScore: 0,
          technicalScore: 0,
          communicationScore: 0,
          clarityScore: 0,
          strengths: "No answers were provided to evaluate.",
          weaknesses: "The candidate did not attempt any questions. All questions were left blank.",
          feedback: "No answers were submitted. Please attempt the interview questions to receive a meaningful evaluation.",
        };
      }

      const prompt = `
You are a strict technical interview evaluator. Evaluate the following mock interview based ONLY on the actual answers provided by the candidate. Be honest and critical.

CRITICAL RULES:
- If a question was SKIPPED or has "[SKIPPED - No answer provided]", that question scores 0.
- Score each answer based on correctness, depth, and clarity.
- The overallScore must reflect the proportion of questions answered and the quality of those answers.
- If only ${answeredCount} out of ${questions.length} questions were answered, the maximum possible overallScore is roughly ${Math.round((answeredCount / questions.length) * 100)}.
- Do NOT give high scores for missing or vague answers.

Role: ${role}
Tech Stack: ${techStack}
Difficulty: ${difficulty}
Questions Answered: ${answeredCount} out of ${questions.length}

Questions and Candidate Answers:
${formattedQuestions}

Return ONLY a valid JSON object with these exact keys:
{
  "overallScore": <0-100>,
  "technicalScore": <0-100>,
  "communicationScore": <0-100>,
  "clarityScore": <0-100>,
  "strengths": "<string>",
  "weaknesses": "<string>",
  "feedback": "<string>"
}
`;

      const rawText = await callNvidia(prompt);
      const evaluation = extractJson(rawText);

      const overall = Number(evaluation.overallScore ?? evaluation.overall_score ?? evaluation.score);
      const tech = Number(evaluation.technicalScore ?? evaluation.technical_score);
      const comm = Number(evaluation.communicationScore ?? evaluation.communication_score);
      const clar = Number(evaluation.clarityScore ?? evaluation.clarity_score);

      // Sanity cap: score cannot exceed proportion of answered questions + small buffer
      const maxReasonable = Math.round((answeredCount / questions.length) * 100) + 10;

      return {
        overallScore: Math.min(overall || 0, maxReasonable),
        technicalScore: Math.min(tech || 0, maxReasonable),
        communicationScore: Math.min(comm || 0, maxReasonable),
        clarityScore: Math.min(clar || 0, maxReasonable),
        strengths: evaluation.strengths || "No notable strengths identified.",
        weaknesses: evaluation.weaknesses || "Insufficient answers provided for evaluation.",
        feedback: evaluation.feedback || "Please attempt more questions for a meaningful evaluation.",
      };
    } catch (error) {
      console.error(
        "EVALUATION NVIDIA ERROR - FALLBACK TRIGGERED:",
        error
      );

      // FALLBACK MOCK RESPONSE
      return {
        overallScore: 0,
        technicalScore: 0,
        communicationScore: 0,
        clarityScore: 0,
        strengths:
          "Evaluation could not be completed due to a service error.",
        weaknesses:
          "Please try submitting again.",
        feedback:
          "An error occurred during evaluation. Please retry.",
      };
    }
  };