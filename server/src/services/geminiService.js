// NVIDIA NIM API integration (OpenAI-compatible /chat/completions endpoint)
// Docs: https://build.nvidia.com/

const NVIDIA_API_URL =
  "https://integrate.api.nvidia.com/v1/chat/completions";

const CANDIDATE_MODELS = [
  process.env.NVIDIA_MODEL,
  "meta/llama-3.3-70b-instruct",
  "meta/llama-3.1-70b-instruct",
  "mistralai/mistral-7b-instruct-v0.3",
].filter(Boolean);

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

const extractJsonArray = (text) => {
  if (!text || typeof text !== "string") {
    throw new Error("Empty AI text response");
  }
  const trimmed = text.trim();

  try {
    const res = JSON.parse(trimmed);
    if (Array.isArray(res)) return res;
  } catch (e) {}

  const clean = trimmed
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    const res = JSON.parse(clean);
    if (Array.isArray(res)) return res;
  } catch (e) {}

  const firstBracket = clean.indexOf("[");
  const lastBracket = clean.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    const jsonSub = clean.substring(firstBracket, lastBracket + 1);
    try {
      const res = JSON.parse(jsonSub);
      if (Array.isArray(res)) return res;
    } catch (e) {}
  }

  throw new Error("Could not extract a valid JSON array from response.");
};

const callNvidia = async (prompt) => {
  let lastError = null;

  for (const model of CANDIDATE_MODELS) {
    if (typeof model === "string" && model.includes("deepseek-v4-flash")) {
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
            { role: "system", content: "You are a JSON-only generator API. Output strictly a JSON array of string questions. Do not include markdown, code blocks, or preamble text." },
            { role: "user", content: prompt },
          ],
          temperature: 0.5,
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

export const generateInterviewQuestions =
  async ({
    role,
    techStack,
    difficulty,
  }) => {
    try {
      const prompt = `
Generate 10 technical interview questions for a candidate with:

Role: ${role}
Tech Stack: ${techStack}
Difficulty: ${difficulty}

Rules:
- Return ONLY a valid JSON array of strings
- Example format: ["Question 1 text", "Question 2 text"]
- No markdown code blocks
- No intro or extra text
`;

      const text = await callNvidia(prompt);
      const questions = extractJsonArray(text);

      return questions;
    } catch (error) {
      console.error(
        "NVIDIA ERROR - USING MOCK QUESTIONS:",
        error
      );

      return mockQuestions;
    }
  };  