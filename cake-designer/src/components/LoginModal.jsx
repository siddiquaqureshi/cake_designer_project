import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginModal({ onClose }) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate() {
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Enter a valid email address";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    if (mode === "signup" && form.name.trim().length < 2) return "Enter your name";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setBusy(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await signup(form.name, form.email, form.password);
      }
      onClose();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] bg-ink/50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-sm p-8 pop-in border border-line"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-6 mb-6 border-b border-line">
          {["login", "signup"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`pb-3 tracked text-xs transition-colors border-b-2 -mb-px ${
                mode === m ? "border-ink text-ink" : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              {m === "login" ? "Log in" : "Sign up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Full name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="px-4 py-3 bg-white border border-line focus:border-ink outline-none transition-colors"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="px-4 py-3 bg-white border border-line focus:border-ink outline-none transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            className="px-4 py-3 bg-white border border-line focus:border-ink outline-none transition-colors"
          />
          {error && <p className="text-xs text-ink">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="mt-1 py-3.5 bg-ink text-white tracked text-xs hover:bg-black transition-colors disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        <button onClick={onClose} className="w-full text-center text-xs text-ink-soft mt-5 hover:underline tracked">
          Close
        </button>
      </div>
    </div>
  );
}
