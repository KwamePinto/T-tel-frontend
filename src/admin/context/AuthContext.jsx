import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.auth
      .me()
      .then(({ user: u }) => !cancelled && setUser(u))
      .catch(() => !cancelled && setUser(null)) // 401 simply means signed out
      .finally(() => !cancelled && setReady(true));
    return () => { cancelled = true; };
  }, []);

  const login = async (email, password) => {
    const { user: u } = await api.auth.login(email, password);
    setUser(u);
    return u;
  };

  const logout = async () => {
    await api.auth.logout().catch(() => {});
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
