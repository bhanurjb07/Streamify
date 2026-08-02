import { useCallback, useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import FileUpload from "./FileUpload";
import CallModal from "./CallModal";
import { useWebRTC } from "../hooks/useWebRTC";

export default function ChatRoom({
  socket,
  partner,
  onNext,
  onDisconnect,
  statusBanner,
}) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [error, setError] = useState("");
  const [callState, setCallState] = useState("idle");
  const [callType, setCallType] = useState(null);
  const [incomingCallType, setIncomingCallType] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const webrtc = useWebRTC(socket, callState, setCallState, setCallType);
  const { cleanupPeer, endCall: endWebRTCCall } = webrtc;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isPartnerTyping, scrollToBottom]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleTyping = ({ isTyping }) => {
      setIsPartnerTyping(isTyping);
    };

    const handleFile = (fileMsg) => {
      setMessages((prev) => [...prev, fileMsg]);
    };

    const handleFileError = ({ message }) => {
      setError(message);
    };

    const handleIncomingCall = ({ callType: type }) => {
      setIncomingCallType(type);
      setCallState("ringing");
    };

    const handlePartnerSkipped = ({ message }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          text: message,
          timestamp: Date.now(),
          sender: "system",
        },
      ]);
      cleanupPeer();
      setCallState("idle");
      setCallType(null);
    };

    const handlePartnerDisconnected = ({ message }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          text: message,
          timestamp: Date.now(),
          sender: "system",
        },
      ]);
      cleanupPeer();
      setCallState("idle");
      setCallType(null);
    };

    socket.on("receive-message", handleMessage);
    socket.on("message-sent", handleMessage);
    socket.on("partner-typing", handleTyping);
    socket.on("receive-file", handleFile);
    socket.on("file-sent", handleFile);
    socket.on("file-error", handleFileError);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("partner-skipped", handlePartnerSkipped);
    socket.on("partner-disconnected", handlePartnerDisconnected);

    return () => {
      socket.off("receive-message", handleMessage);
      socket.off("message-sent", handleMessage);
      socket.off("partner-typing", handleTyping);
      socket.off("receive-file", handleFile);
      socket.off("file-sent", handleFile);
      socket.off("file-error", handleFileError);
      socket.off("incoming-call", handleIncomingCall);
      socket.off("partner-skipped", handlePartnerSkipped);
      socket.off("partner-disconnected", handlePartnerDisconnected);
    };
  }, [socket, cleanupPeer]);

  const emitTyping = useCallback(
    (isTyping) => {
      if (!socket) return;
      socket.emit("typing", { isTyping });
    },
    [socket]
  );

  const handleInputChange = (e) => {
    setInputText(e.target.value);

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      emitTyping(true);
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      emitTyping(false);
    }, 1000);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !socket) return;

    socket.emit("send-message", { text: inputText.trim() });
    setInputText("");
    isTypingRef.current = false;
    emitTyping(false);
    clearTimeout(typingTimeoutRef.current);
  };

  const handleFileSelect = (fileData) => {
    if (!socket) return;
    socket.emit("send-file", fileData);
    setError("");
  };

  const handleNext = () => {
    endWebRTCCall();
    setMessages([]);
    setIsPartnerTyping(false);
    onNext();
  };

  const handleDisconnect = () => {
    endWebRTCCall();
    onDisconnect();
  };

  return (
    <div className="flex h-screen flex-col bg-slate-950">
      <header className="flex shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3">
        <div>
          <h2 className="font-semibold text-white">
            {partner?.name || "Stranger"}
          </h2>
          <p className="text-xs text-slate-400">
            {partner?.gender} · Connected
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => webrtc.startCall("audio")}
            disabled={callState !== "idle"}
            title="Start audio call"
            aria-label="Start audio call"
            className="rounded-lg bg-slate-800 p-2 text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => webrtc.startCall("video")}
            disabled={callState !== "idle"}
            title="Start video call"
            aria-label="Start video call"
            className="rounded-lg bg-slate-800 p-2 text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </header>

      {statusBanner && (
        <div className="bg-amber-600/20 px-4 py-2 text-center text-sm text-amber-300">
          {statusBanner}
        </div>
      )}

      {error && (
        <div className="bg-red-600/20 px-4 py-2 text-center text-sm text-red-300">
          {error}
          <button
            type="button"
            onClick={() => setError("")}
            className="ml-2 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-4">
        {messages.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-slate-500">
            Say hello! You&apos;re connected with a stranger.
          </p>
        )}
        {messages.map((msg) =>
          msg.sender === "system" ? (
            <div key={msg.id} className="px-4 py-2 text-center text-xs text-slate-500">
              {msg.text}
            </div>
          ) : (
            <MessageBubble key={msg.id} message={msg} />
          )
        )}
        {isPartnerTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="flex shrink-0 items-center gap-2 border-t border-slate-800 bg-slate-900 px-4 py-3"
      >
        <FileUpload onFileSelect={handleFileSelect} onError={setError} />
        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-2"
        />
        <button
          type="button"
          onClick={handleNext}
          className="shrink-0 rounded-xl bg-amber-600/20 px-3 py-2.5 text-sm font-medium text-amber-400 transition hover:bg-amber-600/30"
        >
          Next
        </button>
        <button
          type="button"
          onClick={handleDisconnect}
          className="shrink-0 rounded-xl bg-red-600/20 px-3 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-600/30"
        >
          Disconnect
        </button>
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="shrink-0 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </form>

      <CallModal
        callState={callState}
        incomingCallType={incomingCallType}
        callType={callType}
        localStream={webrtc.localStream}
        remoteStream={webrtc.remoteStream}
        isMuted={webrtc.isMuted}
        isCameraOff={webrtc.isCameraOff}
        onAccept={webrtc.acceptCall}
        onReject={webrtc.rejectCall}
        onEndCall={webrtc.endCall}
        onToggleMute={webrtc.toggleMute}
        onToggleCamera={webrtc.toggleCamera}
      />
    </div>
  );
}
