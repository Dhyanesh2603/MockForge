import "dotenv/config";
import http from "node:http";
import { Server } from "socket.io";
import app from "./app.js";
import { initClashSocket } from "./services/clashSocketService.js";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

initClashSocket(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});