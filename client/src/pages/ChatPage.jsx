import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon, SendIcon } from "lucide-react";
import toast from "react-hot-toast";

import useAuthUser from "../hooks/useAuthUser";
import useSocket from "../hooks/useSocket";
import { getMessages } from "../lib/api";
import ChatLoader from "../components/ChatLoader";

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const { authUser } = useAuthUser();
  const { socket, isConnected } = useSocket(!!authUser);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const { data: history, isLoading } = useQuery({
    queryKey: ["messages", targetUserId],
    queryFn: () => getMessages(targetUserId),
    enabled: !!authUser && !!targetUserId,
  });

  useEffect(() => {
    if (history) setMessages(history);
  }, [history]);

  useEffect(() => {
    if (!socket || !targetUserId) return;

    socket.emit("join_conversation", { recipientId: targetUserId });

    const handleNewMessage = (message) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m._id === message._id);
        if (exists) return prev;
        return [...prev, message];
      });
    };

    const handleError = ({ message }) => {
      toast.error(message);
    };

    socket.on("new_message", handleNewMessage);
    socket.on("message_error", handleError);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("message_error", handleError);
    };
  }, [socket, targetUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !socket || !isConnected) return;

    socket.emit("send_message", {
      recipientId: targetUserId,
      text: input.trim(),
    });
    setInput("");
  };

  if (isLoading || !authUser) return <ChatLoader />;

  return (
    <div className="h-[93vh] flex flex-col bg-base-200">
      <div className="navbar bg-base-100 border-b border-base-300 px-4">
        <Link to="/" className="btn btn-ghost btn-sm gap-2">
          <ArrowLeftIcon className="size-4" />
          Back
        </Link>
        <span className="font-semibold ml-2">Chat</span>
        <span
          className={`ml-auto badge badge-sm ${isConnected ? "badge-success" : "badge-error"}`}
        >
          {isConnected ? "Online" : "Offline"}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-base-content/60 mt-8">No messages yet. Say hello!</p>
        )}

        {messages.map((message) => {
          const senderId = message.sender?._id?.toString() || message.sender?.toString();
          const isOwn = senderId === authUser._id.toString();

          return (
            <div key={message._id} className={`chat ${isOwn ? "chat-end" : "chat-start"}`}>
              {!isOwn && message.sender?.profilePic && (
                <div className="chat-image avatar">
                  <div className="w-8 rounded-full">
                    <img src={message.sender.profilePic} alt={message.sender.fullName || "User"} />
                  </div>
                </div>
              )}
              <div className={`chat-bubble ${isOwn ? "chat-bubble-primary" : "chat-bubble-secondary"}`}>
                {message.text}
              </div>
              <div className="chat-footer opacity-50 text-xs">
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-base-100 border-t border-base-300">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="input input-bordered flex-1"
            disabled={!isConnected}
          />
          <button type="submit" className="btn btn-primary" disabled={!input.trim() || !isConnected}>
            <SendIcon className="size-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPage;
