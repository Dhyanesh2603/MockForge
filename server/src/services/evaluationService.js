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

const callNvidia = async (prompt, maxTokens = 2048) => {
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
          max_tokens: maxTokens,
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
    role = "Software Engineer",
    techStack = "General",
    difficulty = "Medium",
    questions = [],
    answers = [],
  } = {}) => {
    try {
      const validQuestions = Array.isArray(questions) ? questions : [];
      const validAnswers = Array.isArray(answers) ? answers : [];

      // Count how many questions actually have a real answer and build Q&A pairs
      let answeredCount = 0;
      const qaPairs = validQuestions.map((question, index) => {
        const qId = String(question.id ?? question.question_id ?? question.questionId ?? (index + 1));
        const matchingAnswer = validAnswers.find((answer) => {
          const aId = String(answer.question_id ?? answer.questionId ?? answer.id ?? "");
          return aId === qId || aId === String(index + 1);
        });
        const answerText = matchingAnswer?.answer_text?.trim() || matchingAnswer?.answerText?.trim() || "";
        if (answerText.length > 0) {
          answeredCount++;
        }
        return {
          index: index + 1,
          questionText: question.question_text || question.questionText || question.text || `Question ${index + 1}`,
          answerText: answerText || "[SKIPPED - No answer provided]",
          questionId: qId,
        };
      });

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
          questionScores: validQuestions.map(() => 0),
          questionCritiques: validQuestions.map(() => "No answer was provided for this question."),
          skillGaps: ["All topics — no answers provided"],
          strongTopics: [],
        };
      }

      const totalQCount = validQuestions.length || 1;
      const formattedQuestions = qaPairs
        .map((qa) => `Question ${qa.index}:\n${qa.questionText}\n\nCandidate Answer:\n${qa.answerText}`)
        .join("\n\n---\n\n");

      const prompt = `You are a strict technical interview evaluator. Evaluate the following mock interview based ONLY on the actual answers provided by the candidate. Be honest and critical.

CRITICAL RULES:
- If a question was SKIPPED or has "[SKIPPED - No answer provided]", that question scores 0.
- Score each answer based on correctness, depth, and clarity.
- The overallScore must reflect the proportion of questions answered and the quality of those answers.
- If only ${answeredCount} out of ${totalQCount} questions were answered, the maximum possible overallScore is roughly ${Math.round((answeredCount / totalQCount) * 100)}.
- Do NOT give high scores for missing or vague answers.
- questionScores MUST be an array with exactly ${totalQCount} numbers (one per question, in order).
- questionCritiques MUST be an array with exactly ${totalQCount} strings (one critique per question, in order).

Role: ${role}
Tech Stack: ${techStack}
Difficulty: ${difficulty}
Questions Answered: ${answeredCount} out of ${totalQCount}

Questions and Candidate Answers:
${formattedQuestions}

Return ONLY a valid JSON object with these exact keys:
{
  "overallScore": <0-100>,
  "technicalScore": <0-100>,
  "communicationScore": <0-100>,
  "clarityScore": <0-100>,
  "strengths": "<string summarizing what candidate did well>",
  "weaknesses": "<string summarizing areas to improve>",
  "feedback": "<string with overall actionable feedback>",
  "questionScores": [<score for Q1>, <score for Q2>, ...],
  "questionCritiques": ["<critique for Q1>", "<critique for Q2>", ...],
  "skillGaps": ["<topic1>", "<topic2>", ...],
  "strongTopics": ["<topic1>", "<topic2>", ...]
}`;

      const rawText = await callNvidia(prompt, 2048);
      const evaluation = extractJson(rawText) || {};

      const overall = Math.max(0, Math.min(100, Number(evaluation.overallScore ?? evaluation.overall_score ?? evaluation.score) || 0));
      const tech = Math.max(0, Math.min(100, Number(evaluation.technicalScore ?? evaluation.technical_score) || 0));
      const comm = Math.max(0, Math.min(100, Number(evaluation.communicationScore ?? evaluation.communication_score) || 0));
      const clar = Math.max(0, Math.min(100, Number(evaluation.clarityScore ?? evaluation.clarity_score) || 0));

      // Sanity cap for category scores: cannot exceed proportion of answered questions + small buffer
      const maxReasonable = Math.min(100, Math.round((answeredCount / totalQCount) * 100) + 10);

      // Parse per-question scores — ensure it's an array of the right length
      let questionScores = Array.isArray(evaluation.questionScores || evaluation.question_scores)
        ? (evaluation.questionScores || evaluation.question_scores).map((s) => Math.max(0, Math.min(100, Number(s) || 0)))
        : validQuestions.map(() => 0);
      if (questionScores.length < totalQCount) {
        questionScores = [...questionScores, ...Array(totalQCount - questionScores.length).fill(0)];
      } else if (questionScores.length > totalQCount) {
        questionScores = questionScores.slice(0, totalQCount);
      }
      // Set skipped questions to 0
      qaPairs.forEach((qa, i) => {
        if (qa.answerText === "[SKIPPED - No answer provided]") {
          questionScores[i] = 0;
        }
      });

      // Parse per-question critiques
      let questionCritiques = Array.isArray(evaluation.questionCritiques || evaluation.question_critiques)
        ? (evaluation.questionCritiques || evaluation.question_critiques).map((c) => String(c || "No critique available."))
        : validQuestions.map(() => "No critique available.");
      if (questionCritiques.length < totalQCount) {
        questionCritiques = [...questionCritiques, ...Array(totalQCount - questionCritiques.length).fill("No critique available.")];
      } else if (questionCritiques.length > totalQCount) {
        questionCritiques = questionCritiques.slice(0, totalQCount);
      }
      qaPairs.forEach((qa, i) => {
        if (qa.answerText === "[SKIPPED - No answer provided]") {
          questionCritiques[i] = "No answer was provided for this question.";
        }
      });

      // Parse skill gaps and strong topics
      const skillGaps = Array.isArray(evaluation.skillGaps || evaluation.skill_gaps)
        ? (evaluation.skillGaps || evaluation.skill_gaps).map(String)
        : [];
      const strongTopics = Array.isArray(evaluation.strongTopics || evaluation.strong_topics)
        ? (evaluation.strongTopics || evaluation.strong_topics).map(String)
        : [];

      const calculatedOverallScore = questionScores.reduce((acc, curr) => acc + curr, 0);

      return {
        overallScore: calculatedOverallScore,
        technicalScore: Math.min(tech, maxReasonable),
        communicationScore: Math.min(comm, maxReasonable),
        clarityScore: Math.min(clar, maxReasonable),
        strengths: evaluation.strengths || "No notable strengths identified.",
        weaknesses: evaluation.weaknesses || "Insufficient answers provided for evaluation.",
        feedback: evaluation.feedback || "Please attempt more questions for a meaningful evaluation.",
        questionScores,
        questionCritiques,
        skillGaps,
        strongTopics,
      };
    } catch (error) {
      console.error(
        "EVALUATION NVIDIA ERROR - FALLBACK TRIGGERED:",
        error
      );

      return {
        overallScore: 0,
        technicalScore: 0,
        communicationScore: 0,
        clarityScore: 0,
        strengths: "Evaluation could not be completed due to a service error.",
        weaknesses: "Please try submitting again.",
        feedback: "An error occurred during evaluation. Please retry.",
        questionScores: questions.map(() => 0),
        questionCritiques: questions.map(() => "Evaluation failed. Please retry."),
        skillGaps: [],
        strongTopics: [],
      };
    }
  };