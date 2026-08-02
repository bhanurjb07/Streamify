export default function WaitingScreen({ statusMessage }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-700/60 bg-slate-900/80 p-10 text-center shadow-2xl backdrop-blur-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
        <h2 className="text-xl font-semibold text-white">
          {statusMessage || "Looking for someone to chat with..."}
        </h2>
        <p className="mt-3 text-sm text-slate-400">
          Please wait while we match you with a random stranger.
        </p>
        <div className="mt-8 flex items-center justify-center gap-2">
          <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:0ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:150ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
