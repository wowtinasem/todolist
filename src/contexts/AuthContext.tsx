"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  GoogleUser,
  decodeCredential,
  saveUser,
  loadUser,
  clearUser,
} from "@/lib/auth";

interface AuthContextType {
  user: GoogleUser | null;
  loading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (
            element: HTMLElement,
            config: Record<string, unknown>
          ) => void;
          disableAutoSelect: () => void;
        };
      };
    };
    handleCredentialResponse?: (response: { credential: string }) => void;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [loading, setLoading] = useState(true);

  const handleCredentialResponse = useCallback(
    (response: { credential: string }) => {
      const decoded = decodeCredential(response.credential);
      saveUser(decoded);
      setUser(decoded);
    },
    []
  );

  useEffect(() => {
    const saved = loadUser();
    if (saved) {
      setUser(saved);
    }
    setLoading(false);

    window.handleCredentialResponse = handleCredentialResponse;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      delete window.handleCredentialResponse;
    };
  }, [handleCredentialResponse]);

  const signOut = useCallback(() => {
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
    clearUser();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
