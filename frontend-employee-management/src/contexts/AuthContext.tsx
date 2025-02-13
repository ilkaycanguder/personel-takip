import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  authToken: string | null;
  isAuthenticated: boolean;
  role: string | null;
  login: (token: string, role: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const savedRole = localStorage.getItem("userRole");
    if (token) {
      setAuthToken(token);
    }
    if (savedRole) {
      setRole(savedRole);
    }
  }, []);

  const login = (token: string, role: string) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("userRole", role);
    setAuthToken(token);
    setRole(role);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    setAuthToken(null);
    setRole(null);
  };
  const isAuthenticated = !!authToken;

  return (
    <AuthContext.Provider
      value={{ authToken, role, login, logout, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
