import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

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

      const result =
        await model.generateContent(prompt);

      const response =
        await result.response;

      const text = response.text();

      const questions = JSON.parse(text);

      return questions;
    } catch (error) {
      console.error(
        "GEMINI ERROR - USING MOCK QUESTIONS"
      );

      console.error(error);

      return mockQuestions;
    }
  };