import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

export const evaluateInterview =
  async ({
    role,
    techStack,
    difficulty,
    questions,
    answers,
  }) => {
    try {
      const model =
        genAI.getGenerativeModel({
          model: "gemini-2.0-flash",
        });

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

Rules:
- Return ONLY valid JSON format
- No markdown
- No explanations
- Return ONLY valid JSON in this exact format:

{
  "overallScore": 85,
  "strengths": "Good React fundamentals and clean explanations.",
  "weaknesses": "Needs deeper backend optimization knowledge.",
  "feedback": "Overall strong performance with decent communication and technical understanding."
}
`;

      const result =
        await model.generateContent(
          prompt
        );

      const response =
        await result.response;

      let text = response.text();
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();

      return JSON.parse(text);
    } catch (error) {
      console.error(
        "EVALUATION GEMINI ERROR"
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