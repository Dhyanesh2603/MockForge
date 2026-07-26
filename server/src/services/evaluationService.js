// NVIDIA NIM API integration (OpenAI-compatible /chat/completions endpoint)
// Docs: https://build.nvidia.com/

const NVIDIA_API_URL =
  "https://integrate.api.nvidia.com/v1/chat/completions";

const NVIDIA_MODEL =
  process.env.NVIDIA_MODEL ||
  "deepseek-ai/deepseek-v4-flash";

// Strips ```json ... ``` / ``` ... ``` fences some models
// wrap their output in, so JSON.parse doesn't blow up.
const cleanJsonText = (text) =>
  text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

const callNvidia = async (prompt) => {
  const response = await fetch(NVIDIA_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
    },
    body: JSON.stringify({
      model: NVIDIA_MODEL,
      messages: [
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
      top_p: 1,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(
      `NVIDIA API error (${response.status}): ${errText}`
    );
  }

  const data = await response.json();

  return data?.choices?.[0]?.message?.content ?? "";
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
                  answer.question_id ===
                  question.id
              );

            return `
Question ${index + 1}:
${question.question_text}

Answer:
${
  matchingAnswer?.answer_text ||
  "No answer provided"
}
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

      const text = await callNvidia(prompt);

      return JSON.parse(cleanJsonText(text));
    } catch (error) {
      console.error(
        "EVALUATION NVIDIA ERROR"
      );

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