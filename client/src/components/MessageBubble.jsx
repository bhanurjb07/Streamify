function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MessageBubble({ message }) {
  const isYou = message.sender === "you";
  const isImage = message.type === "file" && message.mimeType?.startsWith("image/");
  const isPdf = message.type === "file" && message.mimeType === "application/pdf";

  return (
    <div className={`flex ${isYou ? "justify-end" : "justify-start"} px-4 py-1`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
          isYou
            ? "rounded-br-md bg-indigo-600 text-white"
            : "rounded-bl-md bg-slate-800 text-slate-100"
        }`}
      >
        <p className="mb-0.5 text-xs font-medium opacity-70">
          {isYou ? "You" : "Stranger"} · {formatTime(message.timestamp)}
        </p>

        {message.type === "file" ? (
          <div>
            {isImage && (
              <img
                src={message.data}
                alt={message.name}
                className="mt-1 max-h-64 max-w-full rounded-lg object-contain"
              />
            )}
            {isPdf && (
              <a
                href={message.data}
                download={message.name}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 flex items-center gap-3 rounded-lg border border-slate-600 bg-slate-700/50 p-3 transition hover:bg-slate-700"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/20 text-red-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{message.name}</p>
                  <p className="text-xs opacity-70">{formatFileSize(message.size)} · PDF</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
            )}
          </div>
        ) : (
          <p className="whitespace-pre-wrap break-words text-sm">{message.text}</p>
        )}
      </div>
    </div>
  );
}
