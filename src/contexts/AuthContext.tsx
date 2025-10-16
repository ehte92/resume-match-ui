import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, getCurrentUser } from '@/lib/authApi';
import { hasAuthTokens } from '@/lib/cookies';
import type { User, AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    const initializeAuth = async () => {
      if (hasAuthTokens()) {
        try {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error('Failed to fetch current user:', error);
          // Tokens might be invalid, let axios interceptor handle it
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const userData = await apiLogin({ email, password });
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName?: string): Promise<void> => {
    setIsLoading(true);
    try {
      const userData = await apiRegister({ email, password, full_name: fullName });
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    apiLogout();
    setUser(null);
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, log out the user
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
