import { useState } from "react";

const GENDERS = ["Male", "Female", "Other"];

export default function EntryForm({ onSubmit, isConnecting }) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !gender) return;
    onSubmit({ name: name.trim(), gender });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-700/60 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Random Chat</h1>
          <p className="mt-2 text-sm text-slate-400">
            Talk to a random stranger online. No login required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-300">
              Your Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              maxLength={30}
              className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none ring-indigo-500 transition focus:border-indigo-500 focus:ring-2"
            />
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium text-slate-300">Gender</span>
            <div className="flex flex-wrap gap-3">
              {GENDERS.map((g) => (
                <label
                  key={g}
                  className={`cursor-pointer rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                    gender === g
                      ? "border-indigo-500 bg-indigo-600/30 text-indigo-200"
                      : "border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={gender === g}
                    onChange={(e) => setGender(e.target.value)}
                    className="sr-only"
                    required
                  />
                  {g}
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isConnecting || !name.trim() || !gender}
            className="w-full rounded-xl bg-indigo-600 py-3.5 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isConnecting ? "Connecting..." : "Start Chat"}
          </button>
        </form>
      </div>
    </div>
  );
}
