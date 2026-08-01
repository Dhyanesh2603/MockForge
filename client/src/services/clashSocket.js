import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

let socket = null;

export const getClashSocket = () => {
  if (!socket) {
    socket = io(`${SOCKET_URL}/clash`, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

export const connectClashSocket = () => {
  const s = getClashSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
};

export const disconnectClashSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
