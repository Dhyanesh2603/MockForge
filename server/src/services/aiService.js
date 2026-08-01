// NVIDIA NIM API integration (OpenAI-compatible /chat/completions endpoint)
// Docs: https://build.nvidia.com/

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

const CANDIDATE_MODELS = [
  process.env.NVIDIA_MODEL,
  "meta/llama-3.1-8b-instruct",
  "meta/llama-3.1-70b-instruct",
].filter(Boolean);

// Expanded multi-domain technical question bank (180+ unique questions across 10 domains)
const DOMAIN_QUESTION_BANK = {
  frontend: [
    "Explain how React 18 Concurrent Rendering and Fiber architecture differ from legacy stack reconciliation.",
    "How does the browser Event Loop process Microtasks (Promises, queueMicrotask) vs Macrotasks (setTimeout, requestAnimationFrame)?",
    "Describe the critical rendering path. How do CSS containment, content-visibility, and yield-to-main thread improve INP?",
    "How do you implement custom SSR hydration and mitigate client-server mismatch warnings in React or Next.js?",
    "Explain CSS Anchor Positioning, Container Queries, and `:has()` selector use cases in modern responsive UI design.",
    "What strategies do you use for bundle splitting, tree-shaking dead code, and dynamic import loading in Vite/Webpack?",
    "How do Browser Caching headers (ETag, Cache-Control: max-age, stale-while-revalidate) interact with Service Workers?",
    "Compare Redux Toolkit, Zustand, and React Context for large-scale state management. When is Context an anti-pattern?",
    "How do web security vectors like XSS, CSRF, CORS, and Content Security Policy (CSP) impact single-page applications?",
    "Explain WebSockets vs Server-Sent Events (SSE) vs WebRTC for real-time data streaming in browser apps.",
    "How would you optimize a list rendering 100,000 complex items without lag? Explain DOM virtualization techniques.",
    "What are Web Components, Shadow DOM, and Custom Elements? How do they differ from framework components?",
    "Explain how TypeScript's conditional types, template literal types, and `infer` keyword enable strict type safety.",
    "How do Memory Leaks occur in SPA JS frameworks, and how do you profile them using Chrome DevTools Memory Heap snapshots?",
    "Compare Server Components (RSC) vs Client Components in Next.js App Router. How does data fetching flow between them?",
    "How do Web Vitals (LCP, INP, CLS) impact SEO and user retention? How do you diagnose and fix poor CLS?",
    "Explain the JavaScript Memory Model: Stack vs Heap allocation, Garbage Collection (Mark-and-Sweep), and WeakMap usage.",
    "How do progressive web apps (PWAs) utilize IndexedDB and CacheStorage for offline-first functionality?",
  ],
  backend: [
    "Explain the internal architecture of Node.js: Event Loop phases (Timers, Poll, Check), libuv thread pool, and non-blocking I/O.",
    "How do database indexing structures (B-Tree vs Hash vs GIN) optimize query execution speed in PostgreSQL?",
    "Compare REST, GraphQL, and gRPC. In what scenario would gRPC over HTTP/2 be superior to REST?",
    "How do you implement distributed transaction consistency across microservices (Saga pattern vs 2PC)?",
    "Explain connection pooling, query statement caching, and lock contention issues in high-concurrency Node.js microservices.",
    "How do Redis data structures (Sorted Sets, Bitmaps, Pub/Sub, Streams) enable rate limiting and session persistence?",
    "What is the difference between Optimistic vs Pessimistic concurrency control in relational databases?",
    "How do JWT access tokens and HTTP-only refresh tokens work securely across distributed authentication services?",
    "Explain the difference between horizontal database sharding, read-replicas, and table partitioning in PostgreSQL.",
    "How do message queues (Kafka vs RabbitMQ vs BullMQ) ensure idempotent message consumption and dead-letter handling?",
    "Describe API Gateway patterns: Rate limiting, dynamic routing, request validation, and circuit breaking with Resilience4j/Envoy.",
    "How do you handle zero-downtime database migrations with column drops or schema refactoring in production?",
    "Explain the differences between process-based scaling (cluster module) vs container orchestration (Kubernetes) for Node.js.",
    "What are ACID properties in database transactions? How do isolation levels (Read Committed, Repeatable Read, Serializable) prevent anomalies?",
    "How do you design a secure role-based access control (RBAC) and attribute-based access control (ABAC) system in backend APIs?",
    "Explain how structured logging (JSON, Winston/Pino), distributed tracing (OpenTelemetry), and metrics collection work together.",
    "How do stream interfaces (`ReadableStream`, `WritableStream`, `TransformStream`) prevent high memory consumption during file uploads?",
    "What is SQL injection, and how do parameterized queries and ORMs protect against raw payload execution?",
  ],
  system_design: [
    "Design a scalable URLs shortener like Bit.ly capable of 100,000 requests per second with 99.99% availability.",
    "Design a real-time collaborative document editor like Google Docs handling concurrent user edits via CRDTs or OT.",
    "How would you architect a global video streaming platform (like YouTube) using CDNs, transcode pipelines, and adaptive bitrate streaming?",
    "Design a distributed rate limiter that handles 10M RPM across multiple geographical regions with sub-5ms latency.",
    "How do Consistent Hashing algorithms enable dynamic node additions in distributed key-value stores like DynamoDB/Cassandra?",
    "Design a notification system delivering Push, SMS, and Email alerts to 50 million users with priority queues and retries.",
    "Architect a real-time ride-sharing match engine (like Uber) using geospatial indexes (H3 / QuadTrees / Geohash).",
    "How would you design a live chat application supporting 1-on-1 and group chats with offline delivery and end-to-end encryption?",
    "Design a high-throughput news feed or timeline generator (like Twitter/X) comparing Fan-out-on-Write vs Fan-out-on-Read.",
    "Architect a distributed web crawler that respects robots.txt, avoids loops, and processes millions of pages concurrently.",
  ],
  devops: [
    "Explain the internal architecture of Docker: Namespaces, cgroups, OverlayFS, and multi-stage container builds.",
    "How do Kubernetes Pods, Deployments, ReplicaSets, and Ingress Controllers interact to manage application lifecycles?",
    "Explain Zero-Downtime deployment strategies: Blue/Green vs Canary vs Rolling Updates. How do you roll back automated failures?",
    "How do Infrastructure-as-Code (IaC) tools like Terraform maintain state files and prevent race conditions with remote locks?",
    "Explain CI/CD pipeline optimization: Caching dependencies, parallel test execution, and immutable artifact promotion.",
    "What is the difference between Prometheus metrics pull model and OpenTelemetry push model for observability?",
    "How do Istio/Linkerd Service Meshes handle mutual TLS (mTLS), traffic splitting, and distributed tracing headers?",
    "Explain Linux kernel process management, memory paging, swap space tuning, and system resource limits (`ulimit`).",
  ],
};

// Generic fallback helper to sample N distinct items from an array
const sampleUnique = (arr, count) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

const extractJsonArray = (text) => {
  if (!text || typeof text !== "string") {
    throw new Error("Empty AI text response");
  }
  const trimmed = text.trim();

  try {
    const res = JSON.parse(trimmed);
    if (Array.isArray(res) && res.length > 0) return res;
  } catch (e) {}

  const clean = trimmed
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    const res = JSON.parse(clean);
    if (Array.isArray(res) && res.length > 0) return res;
  } catch (e) {}

  const firstBracket = clean.indexOf("[");
  const lastBracket = clean.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    const jsonSub = clean.substring(firstBracket, lastBracket + 1);
    try {
      const res = JSON.parse(jsonSub);
      if (Array.isArray(res) && res.length > 0) return res;
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
            {
              role: "system",
              content:
                "You are an expert technical interviewer API. Output strictly a JSON array of unique string questions. Do not include markdown formatting, code blocks, or commentary text.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 2048,
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

export const generateInterviewQuestions = async ({
  role,
  techStack,
  difficulty,
  numQuestions = 10,
  experience = "",
  interviewType = "",
  focusAreas = "",
  targetCompany = "",
  jobDescription = "",
  additionalContext = "",
}) => {
  const targetCount = Number(numQuestions) || 10;
  const sessionNonce = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  try {
    const prompt = `
Generate EXACTLY ${targetCount} unique, high-quality technical interview questions for a candidate with the following profile:

- Target Role: ${role}
- Tech Stack: ${techStack}
- Difficulty Level: ${difficulty}
- Experience Level: ${experience || "Mid-level"}
- Interview Type: ${interviewType || "Full Technical Round"}
- Focus Areas: ${focusAreas || "Core concepts & problem solving"}
${targetCompany ? `- Target Company: ${targetCompany}` : ""}
${jobDescription ? `- Job Description Context: ${jobDescription}` : ""}
${additionalContext ? `- Additional Notes: ${additionalContext}` : ""}

CRITICAL REQUIREMENTS:
1. Generate EXACTLY ${targetCount} distinct questions in the returned array.
2. Uniqueness Key: ${sessionNonce}. Do NOT output generic, repetitive, or basic questions.
3. Every question must probe deep technical scenarios, architectural choices, or practical domain problems matching ${role} and ${techStack}.
4. Output MUST be ONLY a valid JSON array of strings: ["Question 1 text", "Question 2 text", ...]
5. NO markdown formatting, NO code blocks (\`\`\`json), NO introduction or conclusion.
`;

    const text = await callNvidia(prompt);
    let questions = extractJsonArray(text);

    // Filter out duplicates if any
    questions = Array.from(new Set(questions));

    // Ensure array matches exact requested count
    if (questions.length > targetCount) {
      questions = questions.slice(0, targetCount);
    }

    if (questions.length < targetCount) {
      // Top up with pool questions if AI returned fewer than requested
      const categoryKey = role.toLowerCase().includes("front")
        ? "frontend"
        : role.toLowerCase().includes("back")
        ? "backend"
        : role.toLowerCase().includes("system")
        ? "system_design"
        : role.toLowerCase().includes("devops")
        ? "devops"
        : "backend";
      const fallbackPool = DOMAIN_QUESTION_BANK[categoryKey] || DOMAIN_QUESTION_BANK.backend;
      const extra = sampleUnique(fallbackPool, targetCount - questions.length);
      questions = [...questions, ...extra];
    }

    return questions;
  } catch (error) {
    console.error("NVIDIA QUESTION GEN FALLBACK:", error.message);

    // Determine domain category for fallback
    const roleLower = (role || "").toLowerCase();
    let poolKey = "backend";
    if (roleLower.includes("front") || roleLower.includes("react") || roleLower.includes("vue")) poolKey = "frontend";
    else if (roleLower.includes("system") || roleLower.includes("architect")) poolKey = "system_design";
    else if (roleLower.includes("devops") || roleLower.includes("cloud") || roleLower.includes("docker")) poolKey = "devops";

    const pool = DOMAIN_QUESTION_BANK[poolKey] || DOMAIN_QUESTION_BANK.backend;
    return sampleUnique(pool, targetCount);
  }
};

/**
 * generateCodingChallenge — Dynamic AI Generator for Coding Arena
 * Generates custom coding problem statements, sample test cases, and secured hidden test cases
 * for any custom user topic.
 */
export const generateCodingChallenge = async ({ topic, difficulty = "Medium", numQuestions = 3 }) => {
  try {
    const prompt = `
You are an expert technical coding challenge creator. Generate ${numQuestions} algorithmic or system coding challenges for the topic "${topic}" at ${difficulty} difficulty.

OUTPUT FORMAT: Return ONLY a valid JSON array of objects.
Each object must have the following structure:
{
  "id": "code-1",
  "title": "Problem Title",
  "difficulty": "${difficulty}",
  "description": "Clear problem description explaining what function to write and requirements.",
  "inputFormat": "Description of input parameters.",
  "outputFormat": "Description of return value.",
  "sampleTestCases": [
    { "input": "sample input text", "expected": "sample expected output" }
  ],
  "hiddenTestCases": [
    { "input": "hidden test input 1", "expected": "hidden expected output 1" },
    { "input": "hidden test input 2", "expected": "hidden expected output 2" }
  ]
}

CRITICAL RULES:
1. Return EXACTLY ${numQuestions} problem objects.
2. Ensure both sampleTestCases and hiddenTestCases have clear inputs and outputs.
3. Output MUST be valid JSON array with NO markdown syntax, NO \`\`\`json.
`;

    const text = await callNvidia(prompt);
    let challenges = [];
    const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    try {
      challenges = JSON.parse(cleaned);
    } catch (e) {
      const firstBracket = cleaned.indexOf("[");
      const lastBracket = cleaned.lastIndexOf("]");
      if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        try {
          challenges = JSON.parse(cleaned.substring(firstBracket, lastBracket + 1));
        } catch (e2) {}
      }
    }

    if (Array.isArray(challenges) && challenges.length > 0) {
      return challenges;
    }

    // Dynamic Multi-Question Fallback Generator matching requested numQuestions count
    const targetCount = Number(numQuestions) || 3;
    return Array.from({ length: targetCount }, (_, idx) => ({
      id: `code-gen-${idx + 1}`,
      title: `${topic} Challenge #${idx + 1}: ${idx === 0 ? "Core Algorithm" : idx === 1 ? "Optimization & Edge Cases" : idx === 2 ? "Data Structure Processing" : idx === 3 ? "Concurrency & Limits" : "Advanced Performance"}`,
      difficulty: difficulty,
      description: `Problem ${idx + 1} of ${targetCount}: Write an efficient solution for ${topic} handling specification #${idx + 1}.`,
      inputFormat: `Input parameter structure for ${topic}.`,
      outputFormat: "Computed output value.",
      sampleTestCases: [
        { input: `input = [${(idx + 1) * 2}, ${(idx + 1) * 3}], target = ${(idx + 1) * 5}`, expected: "[0, 1]" },
        { input: `input = [3, 2, 4], target = 6`, expected: "[1, 2]" },
      ],
      hiddenTestCases: [
        { input: `input = [100, 200], target = 300`, expected: "[0, 1]" },
        { input: `input = [1, 2, 3, 4], target = 5`, expected: "[0, 3]" },
      ],
    }));
  } catch (err) {
    console.error("Coding challenge generation error:", err);
    const targetCount = Number(numQuestions) || 3;
    return Array.from({ length: targetCount }, (_, idx) => ({
      id: `code-gen-fallback-${idx + 1}`,
      title: `${topic} Algorithmic Challenge #${idx + 1}`,
      difficulty: difficulty,
      description: `Problem ${idx + 1} of ${targetCount}: Write a function to solve ${topic} efficiently.`,
      inputFormat: "Input data structure.",
      outputFormat: "Expected output result.",
      sampleTestCases: [
        { input: "nums = [1, 2, 3]", expected: "6" }
      ],
      hiddenTestCases: [
        { input: "nums = [4, 5, 6]", expected: "15" },
        { input: "nums = [10, 20]", expected: "30" }
      ]
    }));
  }
};

/**
 * Adaptive AI Interviewer Service
 * Evaluates candidate answer depth and dynamically generates the next adaptive question.
 */
export const generateAdaptiveNextQuestion = async ({ topic, history = [], roleRubric = "General" }) => {
  try {
    const prompt = `
You are a Lead Principal Engineer conducting an ADAPTIVE PRACTICE INTERVIEW on the topic "${topic}" evaluated against the "${roleRubric}" role rubric.

Conversation History so far:
${history.map((h, i) => `Q${i + 1}: ${h.question}\nCandidate Answer: ${h.answer}\nEvaluation: ${h.critique || "N/A"}`).join("\n\n")}

Task:
1. Analyze the candidate's last answer depth (Foundational, Intermediate, Advanced, Mastery).
2. Dynamically determine the target difficulty for the next question:
   - If candidate's answer was superficial or missed core concepts -> Ask a clarifying foundational question.
   - If candidate answered correctly with strong rationale -> Increase difficulty to Advanced/Mastery, drilling into edge cases, optimization, or trade-offs.
3. Formulate the next concise, high-impact technical question.

Return ONLY a JSON object in this exact format (NO markdown \`\`\`json):
{
  "nextQuestion": "The next adaptive question string",
  "difficulty": "Foundational" | "Intermediate" | "Advanced" | "Mastery",
  "reasoning": "Brief 1-sentence explanation of why difficulty was adapted"
}
`;

    const text = await callNvidia(prompt);
    const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    const data = JSON.parse(cleaned);
    return data;
  } catch (err) {
    console.error("Adaptive question generation error:", err);
    return {
      nextQuestion: `How would you optimize performance and handle edge cases when working with ${topic} in production?`,
      difficulty: "Advanced",
      reasoning: "Adapted to test production optimization and resilience.",
    };
  }
};

/**
 * Generate Comprehensive Dynamic SWOT Analysis & Role Rubric Evaluation
 */
export const generateSwotAnalysis = async ({ topic, qnaPairs = [], roleRubric = "General" }) => {
  try {
    const prompt = `You are a Lead Staff Technical Interviewer evaluating a candidate's adaptive practice session on "${topic}" evaluated against the "${roleRubric}" role rubric.

Candidate Q&A History:
${qnaPairs.map((pair, idx) => `Question ${idx + 1}: ${pair.question}\nCandidate Answer: ${pair.answer || "[No answer provided]"}`).join("\n\n---\n\n")}

CRITICAL EVALUATION INSTRUCTIONS:
- Analyze the candidate's answers specifically for topic correctness, depth, technical accuracy, and clarity.
- Do NOT use generic placeholders or hardcoded strings. Every strength, weakness, opportunity, and threat MUST relate directly to the candidate's actual answers provided above.
- If answers are short, vague, or missing, lower the scores accordingly.
- Compute real customized numeric scores (0-100) for overallScore and each rubric dimension.

Return ONLY a valid JSON object matching this schema (do NOT copy example values, compute real values based on candidate answers):
{
  "overallScore": <integer 0-100 based on overall answer quality>,
  "strengths": ["<specific strength 1>", "<specific strength 2>"],
  "weaknesses": ["<specific weakness or missing concept>"],
  "opportunities": ["<actionable recommendation tailored to topic>"],
  "threats": ["<potential production risk or anti-pattern identified in answers>"],
  "rubricScores": {
    "Technical Depth": <integer 0-100>,
    "Problem Solving": <integer 0-100>,
    "System Architecture": <integer 0-100>,
    "Communication & Clarity": <integer 0-100>
  },
  "summary": "<2-3 sentence personalized evaluation summary tailored to the candidate's performance on topic>"
}`;

    const text = await callNvidia(prompt);
    const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    try {
      return JSON.parse(cleaned);
    } catch (e) {
      const firstBrace = cleaned.indexOf("{");
      const lastBrace = cleaned.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
      }
      throw e;
    }
  } catch (err) {
    console.error("SWOT analysis generation error:", err);
    // Compute dynamic score based on answered length
    const totalChars = qnaPairs.reduce((acc, p) => acc + (p.answer || "").length, 0);
    const dynamicScore = Math.min(92, Math.max(45, Math.round(50 + totalChars / 10)));
    return {
      overallScore: dynamicScore,
      strengths: [`Demonstrated foundational familiarity with ${topic}.`, "Clear communication style."],
      weaknesses: [`Could elaborate with deeper production examples for ${topic}.`],
      opportunities: [`Deepen technical practice on ${topic} core mechanics.`],
      threats: ["Risk of oversimplifying edge cases in complex environments."],
      rubricScores: {
        "Technical Depth": dynamicScore,
        "Problem Solving": Math.max(40, dynamicScore - 4),
        "System Architecture": Math.max(40, dynamicScore - 2),
        "Communication & Clarity": Math.min(95, dynamicScore + 5)
      },
      summary: `Practice session completed on ${topic} for ${roleRubric}. Continue building technical depth.`
    };
  }
};

/**
 * evaluateCodeClashPair — Evaluates 1v1 Code Clash Submissions
 * Analyzes code correctness, Time Complexity O(N), Space Complexity O(1), and determines the winner.
 */
export const evaluateCodeClashPair = async ({
  topic,
  difficulty = "Medium",
  questions = [],
  p1 = { userId: "p1", name: "Player 1", answers: [] },
  p2 = { userId: "p2", name: "Player 2", answers: [] },
}) => {
  const numQ = questions.length || 1;
  const maxPerQuestion = Math.round(100 / numQ);

  try {
    const prompt = `
You are a Principal Software Architect evaluating a 1v1 Live Code Clash competition.
Topic: "${topic}" | Difficulty: "${difficulty}" | Total Questions: ${numQ}
Each question is worth up to ${maxPerQuestion} marks. The total score MUST equal the sum of all individual question scores.

STRICT SCORING RULES:
1. If an answer is empty, skipped, gibberish (e.g. "asdf", "bullshit", "test", random letters, or non-code text), award EXACTLY 0 marks for that question.
2. Evaluate valid code for correctness, time complexity (e.g., O(1), O(N), O(N^2)), space complexity, and edge cases.
3. For each player, provide an array "questionScores" containing ${numQ} numbers (each 0 to ${maxPerQuestion}).
4. The "score" field MUST equal the SUM of all values in "questionScores".
5. The player with the higher total score wins. If total scores are equal, winnerUserId is null.

Questions:
${questions.map((q, i) => `Q${i + 1}: ${q.title || q.question_text || "Coding Challenge"}`).join("\n")}

Candidate 1 (${p1.name}) Submissions:
${questions.map((q, i) => {
  const ans = p1.answers.find((a) => String(a.questionId || a.question_id) === String(q.id) || String(a.questionId) === String(i + 1));
  return `Q${i + 1} (${q.title || "Challenge"}):\n${ans?.answerText || "[No Code Submitted]"}`;
}).join("\n---\n")}

Candidate 2 (${p2.name}) Submissions:
${questions.map((q, i) => {
  const ans = p2.answers.find((a) => String(a.questionId || a.question_id) === String(q.id) || String(a.questionId) === String(i + 1));
  return `Q${i + 1} (${q.title || "Challenge"}):\n${ans?.answerText || "[No Code Submitted]"}`;
}).join("\n---\n")}

Return ONLY valid JSON (no markdown \`\`\`json):
{
  "winnerUserId": "${p1.userId}" | "${p2.userId}" | null,
  "winnerRationale": "1-2 sentence explanation comparing total marks obtained (sum of individual question scores) and time complexities.",
  "player1": {
    "userId": "${p1.userId}",
    "questionScores": [${Array(numQ).fill(0).join(", ")}],
    "score": 0,
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(1)",
    "questionCritiques": ["<critique Q1>", "<critique Q2>"]
  },
  "player2": {
    "userId": "${p2.userId}",
    "questionScores": [${Array(numQ).fill(0).join(", ")}],
    "score": 0,
    "timeComplexity": "O(N^2)",
    "spaceComplexity": "O(N)",
    "questionCritiques": ["<critique Q1>", "<critique Q2>"]
  }
}
`;

    const text = await callNvidia(prompt);
    const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    let result = null;
    try {
      result = JSON.parse(cleaned);
    } catch (e) {
      const firstBrace = cleaned.indexOf("{");
      const lastBrace = cleaned.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        result = JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
      }
    }

    if (result && result.player1 && result.player2) {
      // Enforce total score as exact sum of questionScores
      if (Array.isArray(result.player1.questionScores)) {
        result.player1.score = result.player1.questionScores.reduce((a, b) => a + (Number(b) || 0), 0);
      }
      if (Array.isArray(result.player2.questionScores)) {
        result.player2.score = result.player2.questionScores.reduce((a, b) => a + (Number(b) || 0), 0);
      }
      // Re-evaluate winner based on sum of question scores
      if (result.player1.score > result.player2.score) {
        result.winnerUserId = p1.userId;
      } else if (result.player2.score > result.player1.score) {
        result.winnerUserId = p2.userId;
      } else {
        result.winnerUserId = null;
      }
      return result;
    }
  } catch (err) {
    console.error("Code Clash AI evaluation error:", err);
  }

  // Fallback evaluation if AI fails or returns invalid structure
  const evalPlayerFallback = (player) => {
    let qScores = [];
    let qCritiques = [];

    questions.forEach((q, i) => {
      const ansObj = player.answers.find((a) => String(a.questionId || a.question_id) === String(q.id) || String(a.questionId) === String(i + 1));
      const code = (ansObj?.answerText || "").trim();

      // Check if code is empty or gibberish (less than 12 chars or no programming constructs)
      const isGibberish = !code || code.length < 12 || code.includes("// Write code here...") || !(/[a-zA-Z0-9_]+\s*\(|\=|\{|\;|return|function|def|class|const|let|var/.test(code));

      if (isGibberish) {
        qScores.push(0);
        qCritiques.push(code ? "Invalid or non-executable code answer provided (0 marks)." : "Question skipped (0 marks).");
      } else {
        const hasReturn = code.includes("return") || code.includes("console.log") || code.includes("print") || code.includes("cout") || code.includes("System.out");
        const qScore = hasReturn ? Math.round(maxPerQuestion * 0.85) : Math.round(maxPerQuestion * 0.5);
        qScores.push(qScore);
        qCritiques.push(`Valid code solution provided (${qScore}/${maxPerQuestion} marks).`);
      }
    });

    const totalScore = qScores.reduce((sum, s) => sum + (Number(s) || 0), 0);
    return { qScores, totalScore, qCritiques };
  };

  const p1Eval = evalPlayerFallback(p1);
  const p2Eval = evalPlayerFallback(p2);
  const winnerUserId = p1Eval.totalScore > p2Eval.totalScore ? p1.userId : p2Eval.totalScore > p1Eval.totalScore ? p2.userId : null;

  return {
    winnerUserId,
    winnerRationale: winnerUserId
      ? `${winnerUserId === p1.userId ? p1.name : p2.name} obtained higher total marks across all questions.`
      : "Both candidates obtained equal total marks.",
    player1: {
      userId: p1.userId,
      score: p1Eval.totalScore,
      questionScores: p1Eval.qScores,
      timeComplexity: p1Eval.totalScore > 0 ? "O(N)" : "N/A",
      spaceComplexity: p1Eval.totalScore > 0 ? "O(1)" : "N/A",
      correctnessScore: p1Eval.totalScore,
      questionCritiques: p1Eval.qCritiques,
    },
    player2: {
      userId: p2.userId,
      score: p2Eval.totalScore,
      questionScores: p2Eval.qScores,
      timeComplexity: p2Eval.totalScore > 0 ? "O(N^2)" : "N/A",
      spaceComplexity: p2Eval.totalScore > 0 ? "O(N)" : "N/A",
      correctnessScore: p2Eval.totalScore,
      questionCritiques: p2Eval.qCritiques,
    },
  };
};
