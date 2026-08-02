import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import EntryForm from "./components/EntryForm";
import WaitingScreen from "./components/WaitingScreen";
import ChatRoom from "./components/ChatRoom";
import { SERVER_URL } from "./config/constants";

const VIEWS = {
  ENTRY: "entry",
  WAITING: "waiting",
  CHAT: "chat",
};

export default function App() {
  const [view, setView] = useState(VIEWS.ENTRY);
  const [partner, setPartner] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusBanner, setStatusBanner] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const socketRef = useRef(null);

  const initSocket = useCallback(() => {
    if (socketRef.current?.connected) return socketRef.current;

    const socket = io(SERVER_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;
    return socket;
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const onConnect = () => setIsSocketConnected(true);
    const onDisconnect = () => setIsSocketConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [view]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || view === VIEWS.ENTRY) return;

    const handleConnected = () => {
      setIsConnecting(false);
    };

    const handleWaiting = () => {
      setView(VIEWS.WAITING);
      setStatusMessage("Searching for a stranger...");
      setPartner(null);
      setStatusBanner("");
    };

    const handleMatched = ({ partner: matchedPartner }) => {
      setPartner(matchedPartner);
      setView(VIEWS.CHAT);
      setStatusMessage("");
      setStatusBanner("");
    };

    const handlePartnerSkipped = () => {
      setView(VIEWS.WAITING);
      setStatusMessage("Stranger skipped. Finding someone new...");
      setPartner(null);
    };

    const handlePartnerDisconnected = () => {
      setView(VIEWS.WAITING);
      setStatusMessage("Stranger disconnected. Finding someone new...");
      setPartner(null);
      setStatusBanner("Stranger has disconnected");
    };

    const handleDisconnected = () => {
      setView(VIEWS.ENTRY);
      setPartner(null);
      setStatusMessage("");
      setStatusBanner("");
      setIsConnecting(false);
    };

    const handleError = ({ message }) => {
      setStatusMessage(message);
      setIsConnecting(false);
    };

    socket.on("connected", handleConnected);
    socket.on("waiting", handleWaiting);
    socket.on("matched", handleMatched);
    socket.on("partner-skipped", handlePartnerSkipped);
    socket.on("partner-disconnected", handlePartnerDisconnected);
    socket.on("disconnected", handleDisconnected);
    socket.on("error", handleError);

    return () => {
      socket.off("connected", handleConnected);
      socket.off("waiting", handleWaiting);
      socket.off("matched", handleMatched);
      socket.off("partner-skipped", handlePartnerSkipped);
      socket.off("partner-disconnected", handlePartnerDisconnected);
      socket.off("disconnected", handleDisconnected);
      socket.off("error", handleError);
    };
  }, [view]);

  const handleStartChat = ({ name, gender }) => {
    const info = { name, gender };
    setIsConnecting(true);
    setStatusMessage("Connecting...");

    const socket = initSocket();

    if (socket.connected) {
      socket.emit("join", info);
    } else {
      socket.once("connect", () => {
        socket.emit("join", info);
      });
    }

    setView(VIEWS.WAITING);
  };

  const handleNext = () => {
    socketRef.current?.emit("find-next");
    setView(VIEWS.WAITING);
    setStatusMessage("Searching for a stranger...");
    setStatusBanner("");
  };

  const handleDisconnect = () => {
    socketRef.current?.emit("disconnect-chat");
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setView(VIEWS.ENTRY);
    setPartner(null);
    setStatusBanner("");
  };

  if (view === VIEWS.ENTRY) {
    return (
      <EntryForm onSubmit={handleStartChat} isConnecting={isConnecting} />
    );
  }

  if (view === VIEWS.WAITING) {
    return (
      <WaitingScreen
        statusMessage={
          !isSocketConnected
            ? "Reconnecting..."
            : statusMessage || "Looking for someone to chat with..."
        }
      />
    );
  }

  return (
    <ChatRoom
      socket={socketRef.current}
      partner={partner}
      onNext={handleNext}
      onDisconnect={handleDisconnect}
      statusBanner={statusBanner}
    />
  );
}
