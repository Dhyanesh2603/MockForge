import {
  getClashRoomByCode,
  getClashQuestions,
  addOrUpdateParticipant,
  getClashParticipants,
  updateParticipantStatus,
  updateParticipantProgress,
  updateClashRoomStatus,
  saveClashAnswer,
  getClashAnswersByRoom,
  saveClashResult,
  getClashResult,
} from "../repositories/clashRepository.js";
import { evaluateClashMatch } from "./clashEvaluationService.js";

export const initClashSocket = (io) => {
  const clashIo = io.of("/clash");

  clashIo.on("connection", (socket) => {
    console.log(`⚡ Socket connected to /clash: ${socket.id}`);

    // JOIN ROOM
    socket.on("join_room", async ({ roomCode, userId, userName, userPicture }) => {
      try {
        if (!roomCode || !userId) return;

        socket.join(roomCode);
        socket.data.roomCode = roomCode;
        socket.data.userId = userId;

        // Ensure participant record exists
        await addOrUpdateParticipant({
          roomCode,
          userId,
          userName: userName || "Candidate",
          userPicture: userPicture || "",
          status: "joined",
        });

        const room = await getClashRoomByCode(roomCode);
        const participants = await getClashParticipants(roomCode);
        const questions = await getClashQuestions(roomCode);

        // Broadcast updated roster to room
        clashIo.to(roomCode).emit("room_updated", {
          room,
          participants,
          questions,
        });
      } catch (err) {
        console.error("Socket join_room error:", err);
      }
    });

    // TOGGLE READY
    socket.on("toggle_ready", async ({ roomCode, userId, ready }) => {
      try {
        const newStatus = ready ? "ready" : "joined";
        await updateParticipantStatus(roomCode, userId, newStatus);

        const room = await getClashRoomByCode(roomCode);
        const participants = await getClashParticipants(roomCode);

        clashIo.to(roomCode).emit("room_updated", {
          room,
          participants,
        });

        // If >= 2 participants and all are ready, start match automatically
        const allReady = participants.length >= 2 && participants.every((p) => p.status === "ready");
        if (allReady) {
          await updateClashRoomStatus(roomCode, "in_progress");
          const startTime = Date.now() + 3000; // 3 second countdown
          const questions = await getClashQuestions(roomCode);

          clashIo.to(roomCode).emit("match_started", {
            startTime,
            questions,
            durationSeconds: questions.length * 180, // 3 mins per question
          });
        }
      } catch (err) {
        console.error("Socket toggle_ready error:", err);
      }
    });

    // UPDATE QUESTION PROGRESS
    socket.on("update_progress", async ({ roomCode, userId, questionIndex }) => {
      try {
        await updateParticipantProgress(roomCode, userId, questionIndex);
        socket.to(roomCode).emit("opponent_progress", {
          userId,
          questionIndex,
        });
      } catch (err) {
        console.error("Socket update_progress error:", err);
      }
    });

    // SUBMIT ANSWERS
    socket.on("submit_answers", async ({ roomCode, userId, answers }) => {
      try {
        // Save answers
        if (Array.isArray(answers)) {
          for (const a of answers) {
            if (a.questionId && a.answerText !== undefined) {
              await saveClashAnswer({
                roomCode,
                userId,
                questionId: a.questionId,
                answerText: a.answerText,
              });
            }
          }
        }

        await updateParticipantStatus(roomCode, userId, "submitted");
        const participants = await getClashParticipants(roomCode);

        // Inform partner that user has submitted
        clashIo.to(roomCode).emit("participant_submitted", {
          userId,
          participants,
        });

        // Check if all participants submitted
        const allSubmitted = participants.every((p) => p.status === "submitted");

        if (allSubmitted) {
          clashIo.to(roomCode).emit("evaluating_match", {
            message: "Evaluating clash match with AI...",
          });

          const room = await getClashRoomByCode(roomCode);
          const questions = await getClashQuestions(roomCode);
          const allAnswers = await getClashAnswersByRoom(roomCode);

          const clashEval = await evaluateClashMatch({
            roomCode,
            role: room.role,
            techStack: room.tech_stack,
            difficulty: room.difficulty,
            questions,
            participants,
            answers: allAnswers,
          });

          await saveClashResult({
            roomCode,
            winnerUserId: clashEval.winnerUserId,
            evaluationData: clashEval,
          });

          await updateClashRoomStatus(roomCode, "completed");

          clashIo.to(roomCode).emit("match_completed", {
            result: clashEval,
          });
        }
      } catch (err) {
        console.error("Socket submit_answers error:", err);
        socket.emit("clash_error", { message: "Failed to evaluate clash match" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};
