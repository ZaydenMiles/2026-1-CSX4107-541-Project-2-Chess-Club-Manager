"use client";

import { createContext, useContext } from "react";

const AuthContext = createContext({ user: null });

export function AuthProvider({ user, children }) {
  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const { user } = useContext(AuthContext);
  return { user, isOrganizer: user?.role === "organizer" };
}
