import { GoogleGenerativeAI } from "@google/generative-ai";
 
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
 
// These are tried in order until one works
const MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-exp",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash-latest",
  "gemini-pro",
];
 
async function callGemini(prompt) {
  for (const name of MODELS) {
    try {
      console.log(`[Gemini] Trying model: ${name}`);
      const model = genAI.getGenerativeModel({ model: name });
      const res = await model.generateContent(prompt);
      const text = res.response.text();
      console.log(`[Gemini] SUCCESS with ${name}, response: ${text.length} chars`);
      return text;
    } catch (e) {
      const is404 = e.message?.includes("404") || e.message?.includes("not found");
      const is429 = e.message?.includes("429") || e.message?.includes("quota");
      console.warn(`[Gemini] ${name} → ${is404 ? "404 not found" : is429 ? "429 quota" : e.message?.slice(0, 60)}`);
      if (is429) throw e; // quota hit — stop immediately, don't burn more requests
      // 404 = wrong model name, try next
    }
  }
  throw new Error("No working Gemini model found. Check your API key and quota at aistudio.google.com");
}
 
function extractArr(raw) {
  const t = raw.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
  const s = t.indexOf("["), e = t.lastIndexOf("]");
  if (s === -1 || e === -1) throw new Error("No JSON array in response: " + t.slice(0, 100));
  return t.slice(s, e + 1);
}
 
export const generateInterviewQuestions = async ({
  role, techStack, difficulty, numQuestions = 10,
  experience = "", interviewType = "", focusAreas = "",
  targetCompany = "", jobDescription = "", additionalContext = "",
}) => {
  const seed = Date.now();
  const angles = [
    "real-world debugging and production scenarios",
    "architectural decisions and design trade-offs",
    "performance bottlenecks and optimisation",
    "edge cases, failure modes, error handling",
    "code quality, testing, maintainability",
    "security vulnerabilities and best practices",
  ];
  const angle = angles[seed % angles.length];
 
  const ctx = [
    experience       && `Experience: ${experience}`,
    interviewType    && `Interview type: ${interviewType}`,
    focusAreas       && `Focus on: ${focusAreas}`,
    targetCompany    && `Target company: ${targetCompany}`,
    additionalContext && additionalContext.slice(0, 150),
    jobDescription   && `JD: ${jobDescription.slice(0, 200)}`,
  ].filter(Boolean).join(". ");
 
  const diffDesc = {
    Easy:   "junior-level foundational concepts",
    Medium: "mid-level with real experience and trade-offs",
    Hard:   "senior-level internals, scale, and architecture",
  }[difficulty] || "intermediate";
 
  const prompt = `Generate ${numQuestions} unique technical interview questions.
Role: ${role}
Tech Stack: ${techStack}
Difficulty: ${difficulty} — ${diffDesc}
Question angle: ${angle}
${ctx ? "Context: " + ctx : ""}
 
Requirements:
- Questions must match the difficulty level strictly
- Specific to ${techStack}, not generic
- No repeated concepts
- Mix of conceptual, practical, scenario-based
 
Return ONLY a valid JSON array of ${numQuestions} question strings. Nothing else.`;
 
  try {
    const raw = await callGemini(prompt);
    const parsed = JSON.parse(extractArr(raw));
    if (!Array.isArray(parsed) || !parsed.length) throw new Error("Empty array");
    console.log(`[Gemini] Generated ${parsed.length} questions successfully`);
    return parsed.sort(() => Math.random() - 0.5).slice(0, numQuestions);
  } catch (e) {
    console.error("[Gemini questions] FAILED:", e.message);
    return buildFallback(role, techStack, numQuestions, seed);
  }
};
 
function buildFallback(role, techStack, n, seed) {
  const pool = [
    `How does ${techStack} handle memory management in production?`,
    `Describe a complex production bug you debugged in ${techStack}.`,
    `What are the biggest performance pitfalls in a ${role} application?`,
    `Explain the trade-offs in choosing a state management approach for ${techStack}.`,
    `How would you design a ${techStack} system to handle 10x current traffic?`,
    `What testing strategy do you apply to critical paths in ${techStack}?`,
    `How do you handle breaking changes when upgrading ${techStack} dependencies?`,
    `What observability and monitoring tools do you use for ${role}?`,
    `How do you onboard a new developer to an existing ${techStack} codebase?`,
    `What security vulnerabilities are most relevant to ${techStack}?`,
    `How do you prevent the most common bugs in ${techStack} applications?`,
    `Walk me through refactoring a large ${techStack} codebase for maintainability.`,
    `How do you handle auth and session management in a ${role} application?`,
    `What CI/CD strategies do you use for ${role} projects?`,
    `How do you ensure API backward compatibility in ${techStack}?`,
  ];
  return pool.sort(() => (Math.sin(seed++) * 10000) % 1 - 0.5).slice(0, n);
}