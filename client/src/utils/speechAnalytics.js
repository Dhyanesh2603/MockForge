/**
 * speechAnalytics.js — Analyzes candidate answer text & spoken input
 * for Words Per Minute (WPM), filler word count, clarity rating, and confidence score.
 */

const FILLER_WORDS = [
  "um", "uh", "like", "you know", "basically", "actually", "sort of",
  "kind of", "I mean", "literally", "honestly", "right", "stuff", "whatever"
];

export function analyzeSpeech(answersMap = {}, timeSpentSeconds = 1800) {
  const allTexts = Object.values(answersMap).filter(Boolean);
  if (allTexts.length === 0) {
    return {
      wpm: 0,
      totalWords: 0,
      fillerCount: 0,
      fillerBreakdown: {},
      clarityScore: 100,
      confidenceScore: 100,
      pacingRating: "Optimal",
      recommendations: ["Provide detailed answers during your interview to get speech analytics."]
    };
  }

  const combinedText = allTexts.join(" ");
  const words = combinedText.trim().split(/\s+/).filter(Boolean);
  const totalWords = words.length;

  // Words per minute (estimated speaking time = totalWords / 130 WPM average)
  const estimatedMinutes = Math.max(0.5, totalWords / 130);
  const wpm = Math.round(totalWords / estimatedMinutes);

  // Filler words counting
  const lowerText = combinedText.toLowerCase();
  let totalFillers = 0;
  const fillerBreakdown = {};

  FILLER_WORDS.forEach((filler) => {
    const regex = new RegExp(`\\b${filler}\\b`, "gi");
    const matches = lowerText.match(regex);
    if (matches && matches.length > 0) {
      fillerBreakdown[filler] = matches.length;
      totalFillers += matches.length;
    }
  });

  // Calculate scores
  const fillerDensity = totalWords > 0 ? (totalFillers / totalWords) * 100 : 0;
  
  // Clarity Score (100 - filler penalty - short answer penalty)
  let clarityScore = Math.max(30, Math.round(100 - fillerDensity * 12));
  if (totalWords < 50) clarityScore = Math.max(40, clarityScore - 20);

  // Confidence Score (based on vocabulary length, sentence structure, lack of hesitations)
  const avgSentenceLength = words.length / Math.max(1, combinedText.split(/[.!?]+/).length);
  let confidenceScore = Math.min(100, Math.max(40, Math.round(70 + avgSentenceLength * 1.5 - totalFillers * 2)));

  // Pacing Rating
  let pacingRating = "Optimal";
  if (wpm < 90) pacingRating = "Slow / Hesitant";
  else if (wpm > 170) pacingRating = "Fast / Rushed";

  // Actionable Recommendations
  const recommendations = [];
  if (totalFillers > 5) {
    recommendations.push(`Reduce filler words like "${Object.keys(fillerBreakdown).slice(0, 2).join('", "')}" to sound more authoritative.`);
  }
  if (wpm < 100) {
    recommendations.push("Try to speak with more momentum and avoid long pauses between thoughts.");
  } else if (wpm > 160) {
    recommendations.push("Pace your answers slightly to allow the interviewer to digest complex technical points.");
  }
  if (confidenceScore >= 80) {
    recommendations.push("Strong executive delivery with structured technical explanation!");
  }

  return {
    wpm,
    totalWords,
    fillerCount: totalFillers,
    fillerBreakdown,
    clarityScore,
    confidenceScore,
    pacingRating,
    recommendations
  };
}
