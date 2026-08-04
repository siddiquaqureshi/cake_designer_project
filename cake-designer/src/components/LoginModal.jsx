import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginModal({ onClose, defaultPortal = "customer" }) {
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const [portal, setPortal] = useState(defaultPortal); // "customer" | "admin"
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
      let loggedUser;
      if (mode === "login") {
        loggedUser = await login(form.email, form.password);
      } else {
        const role = portal === "admin" ? "Baker" : "customer";
        loggedUser = await signup(form.name, form.email, form.password, role);
      }

      onClose();

      const userRole = (loggedUser?.role || "").toLowerCase();
      if (portal === "admin" || ["baker", "admin"].includes(userRole)) {
        navigate("/admin/orders");
      }
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
        className="bg-white w-full max-w-sm p-8 pop-in border border-line shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Portal selector: Customer vs Baker/Admin */}
        <div className="flex bg-bone p-1 mb-6 border border-line">
          <button
            type="button"
            onClick={() => {
              setPortal("customer");
              setError("");
            }}
            className={`flex-1 py-2 text-xs tracked font-semibold transition-colors ${
              portal === "customer" ? "bg-white text-ink shadow-sm" : "text-ink-soft hover:text-ink"
            }`}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => {
              setPortal("admin");
              setError("");
            }}
            className={`flex-1 py-2 text-xs tracked font-semibold transition-colors ${
              portal === "admin" ? "bg-ink text-white shadow-sm" : "text-ink-soft hover:text-ink"
            }`}
          >
            Baker / Admin
          </button>
        </div>

        <div className="flex gap-6 mb-6 border-b border-line">
          {["login", "signup"].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`pb-3 tracked text-xs transition-colors border-b-2 -mb-px ${
                mode === m ? "border-ink text-ink font-semibold" : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              {m === "login" ? (portal === "admin" ? "Admin Login" : "Log in") : "Create account"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === "signup" && (
            <input
              type="text"
              placeholder={portal === "admin" ? "Baker / Admin Name" : "Full name"}
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="px-4 py-3 bg-white border border-line focus:border-ink outline-none transition-colors text-sm"
            />
          )}
          <input
            type="email"
            placeholder={portal === "admin" ? "Admin / Baker Email" : "Email"}
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="px-4 py-3 bg-white border border-line focus:border-ink outline-none transition-colors text-sm"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            className="px-4 py-3 bg-white border border-line focus:border-ink outline-none transition-colors text-sm"
          />
          {error && <p className="text-xs text-ink">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="mt-1 py-3.5 bg-ink text-white tracked text-xs hover:bg-black transition-colors disabled:opacity-60 font-semibold uppercase"
          >
            {busy
              ? "Please wait…"
              : mode === "login"
              ? portal === "admin"
                ? "Login as Admin / Baker"
                : "Log in"
              : portal === "admin"
              ? "Create Admin Account"
              : "Create Account"}
          </button>
        </form>

        <button onClick={onClose} className="w-full text-center text-xs text-ink-soft mt-5 hover:underline tracked">
          Close
        </button>
      </div>
    </div>
  );
}
