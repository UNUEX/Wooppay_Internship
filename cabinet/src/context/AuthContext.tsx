"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { SessionUser } from "@/types";
import * as authService from "@/services/authService";

type AuthContextType = {
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  // при открытии страницы достаём пользователя из localStorage.
  // localStorage есть только в браузере, поэтому читаем его в useEffect, а не при рендере
  useEffect(() => {
    const saved = localStorage.getItem("user");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const loggedUser = await authService.login(email, password);
    setUser(loggedUser);
    localStorage.setItem("user", JSON.stringify(loggedUser));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("user");
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth нужно использовать внутри AuthProvider");
  return context;
}