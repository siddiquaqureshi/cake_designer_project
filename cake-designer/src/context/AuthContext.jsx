import { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as api from "../api/client";

// Context API solves prop-drilling here: the logged-in user is needed by the
// navbar, the wishlist star, the decorate flow, and the checkout page, all of
// which live at different depths of the tree. Passing `user`/`login`/`logout`
// down as props through every intermediate layout component would mean each
// one has to accept and forward props it never itself uses. The context lets
// any component that actually needs auth state subscribe directly to it.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("cd_user");
    if (stored) setUser(JSON.parse(stored));
    setReady(true);
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, user: u } = await api.login(email, password);
    localStorage.setItem("cd_token", token);
    localStorage.setItem("cd_user", JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  const signup = useCallback(async (name, email, password, role = "customer") => {
    const { token, user: u } = await api.signup(name, email, password, role);
    localStorage.setItem("cd_token", token);
    localStorage.setItem("cd_user", JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("cd_token");
    localStorage.removeItem("cd_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}
