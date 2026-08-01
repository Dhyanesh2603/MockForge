import React, { useState, useEffect, useRef } from "react";

/**
 * VoiceInterviewerControls
 * - Reads question aloud via Web Speech Synthesis (TTS)
 * - Dictates candidate answer via Web Speech Recognition (STT)
 */
export default function VoiceInterviewerControls({
  questionText = "",
  onTranscript = () => {},
  currentAnswer = "",
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  const recognitionRef = useRef(null);

  // Initialize Speech Synthesis Voices
  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      setSpeechSupported(false);
      return;
    }

    const updateVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      // Default to English voice
      const engVoice = availableVoices.find(
        (v) => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha"))
      ) || availableVoices.find((v) => v.lang.startsWith("en"));
      if (engVoice) setSelectedVoice(engVoice.name);
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Initialize Speech Recognition (STT)
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        onTranscript((prev) => (prev ? prev + " " + finalTranscript : finalTranscript).trim());
      }
    };

    recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [onTranscript]);

  // Read question aloud (TTS)
  const speakQuestion = () => {
    if (!("speechSynthesis" in window) || !questionText) return;

    window.speechSynthesis.cancel();

    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(questionText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    if (selectedVoice) {
      const vObj = voices.find((v) => v.name === selectedVoice);
      if (vObj) utterance.voice = vObj;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Toggle Microphone Dictation (STT)
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn("STT start error:", err);
      }
    }
  };

  if (!speechSupported) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 14px",
        borderRadius: 14,
        background: "var(--bg2)",
        border: "1px solid var(--border)",
        marginBottom: 14,
        gap: 12,
      }}
    >
      {/* Read Question Aloud */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          type="button"
          onClick={speakQuestion}
          className="btn-press"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 999,
            background: isSpeaking ? "rgba(244, 63, 94, 0.15)" : "var(--surface)",
            border: isSpeaking ? "1px solid #f43f5e" : "1px solid var(--border)",
            color: isSpeaking ? "#f43f5e" : "var(--text)",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <span>{isSpeaking ? "🔊 Pause AI Voice" : "📢 Read Question"}</span>
        </button>

        {voices.length > 0 && (
          <select
            value={selectedVoice || ""}
            onChange={(e) => setSelectedVoice(e.target.value)}
            style={{
              padding: "4px 8px",
              borderRadius: 8,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text3)",
              fontSize: 11,
              outline: "none",
              maxWidth: 140,
            }}
          >
            {voices
              .filter((v) => v.lang.startsWith("en"))
              .map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name.replace(/Google|Microsoft|Apple/g, "").trim()}
                </option>
              ))}
          </select>
        )}
      </div>

      {/* Voice Dictation (Mic to Text) */}
      <button
        type="button"
        onClick={toggleListening}
        className="btn-press"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 14px",
          borderRadius: 999,
          background: isListening
            ? "linear-gradient(135deg, #f43f5e, #e11d48)"
            : "rgba(var(--forge-rgb), 0.12)",
          border: isListening ? "none" : "1px solid rgba(var(--forge-rgb), 0.3)",
          color: isListening ? "#fff" : "var(--forge)",
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: isListening ? "0 0 12px rgba(244,63,94,0.4)" : "none",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: isListening ? "#fff" : "var(--forge)",
            animation: isListening ? "pulse 1s infinite" : "none",
          }}
        />
        <span>{isListening ? "🎙️ Listening... (Stop)" : "🎙️ Voice Answer"}</span>
      </button>
    </div>
  );
}
