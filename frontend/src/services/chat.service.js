import { io } from "socket.io-client";
import useUserStore from "../store/useUserStore";

let socket = null;

export const initializeSocket = () => {
  if (socket) {
    return socket;
  }

  const user = useUserStore.getState().user;

  const BACKEND_URL = import.meta.env.VITE_API_URL;

  socket = io(BACKEND_URL, {
    withCredentials: true,
    transports: ["websockets", "polling"],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("Socket connected", socket.id);
    socket.emit("user_connected", user._id);
  });

  socket.on("connect_error", (error) => {
    console.error("socket connection error", error);
  });

  socket.on("disconnect", (reason) => {
    console.log("socket disconnected", reason);
  });

  return socket;
};

export const getSocket = () => {
    if(!socket) return initializeSocket();
    return socket;
}

export const disconnectSocket = () => {
    if(socket) {
        socket.disconnect();
        socket = null;
    }
}
