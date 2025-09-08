import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService, AuthUser } from "../services";

interface AuthContextType {
  user: AuthUser | null;
  login: (mobile_no: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: AuthUser) => void;
  isAuthenticated: boolean;
  loading: boolean;
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize authentication state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Verify session with the server to ensure cookie is still valid
        const userData = await authService.verifySession();
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (
    mobile_no: string,
    password: string
  ): Promise<boolean> => {
    try {
      const userData = await authService.login(mobile_no, password);
      setUser(userData);
      return true;
    } catch (error) {
      console.error("AuthContext: Login failed:", error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
    }
  };

  const updateUser = (userData: AuthUser): void => {
    setUser(userData);
    // Also update the authService state
    authService.currentUser = userData;
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
