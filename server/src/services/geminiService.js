// NVIDIA NIM API integration (OpenAI-compatible /chat/completions endpoint)
// Docs: https://build.nvidia.com/

const NVIDIA_API_URL =
  "https://integrate.api.nvidia.com/v1/chat/completions";

const NVIDIA_MODEL =
  process.env.NVIDIA_MODEL ||
  "deepseek-ai/deepseek-v4-flash";

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

export const generateInterviewQuestions =
  async ({
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

      const text = await callNvidia(prompt);

      const questions = JSON.parse(
        cleanJsonText(text)
      );

      return questions;
    } catch (error) {
      console.error(
        "NVIDIA ERROR - USING MOCK QUESTIONS"
      );

      console.error(error);

      return mockQuestions;
    }
  };  