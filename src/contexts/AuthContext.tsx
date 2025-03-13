import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getAuthenticatedUser, isAuthenticated, logout, getPocketBaseClient } from "@/utils/pocketbase";
import { debugLog } from "@/utils/debug";

interface AuthContextProps {
  user: Record<string, any> | null;
}

interface AuthProviderProps {
  children: ReactNode; 
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    // Set initial user if authenticated
    if (isAuthenticated()) {
      const authenticatedUser = getAuthenticatedUser();
      debugLog('当前认证用户信息', authenticatedUser);
      setUser(authenticatedUser);
    }

    // Listen for auth changes
    const handleAuthChange = () => {
      const currentUser = isAuthenticated() ? getAuthenticatedUser() : null;
      debugLog('用户认证状态变更', currentUser);
      setUser(currentUser);
    };

    // PocketBase's authStore emits events for changes
    const unsubscribe = getPocketBaseClient().authStore.onChange(handleAuthChange);

    return () => {
      unsubscribe(); // Cleanup listener
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to consume the AuthContext
export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
