import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

let socket = null;

const useSocket = (enabled = true) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socketInstance, setSocketInstance] = useState(null);

  useEffect(() => {
    if (!enabled) return;

    if (!socket) {
      socket = io(SOCKET_URL, { withCredentials: true });
    }

    setSocketInstance(socket);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    if (socket.connected) setIsConnected(true);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [enabled]);

  return { socket: socketInstance, isConnected };
};

export default useSocket;

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
