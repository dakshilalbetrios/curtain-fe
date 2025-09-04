import React, { createContext, useContext, useState, ReactNode } from "react";
import { User, authAPI } from "../services/api";

interface AuthContextType {
  user: User | null;
  login: (user: User) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (user: User): Promise<boolean> => {
    try {
      // Set the user in context
      setUser(user);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Call backend to clear cookies
      await authAPI.logout();
      console.log("Backend logout successful - cookies cleared");
    } catch (error) {
      console.error("Backend logout failed:", error);
    } finally {
      // Clear user from context
      setUser(null);
    }
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
