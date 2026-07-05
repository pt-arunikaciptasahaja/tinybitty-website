import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { isAdminEmail } from '@/lib/adminUtils';

interface AuthContextValue {
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const SESSION_TIMEOUT_MS = 5000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let timedOut = false;

    // Race the session check against a 5-second timeout
    const timeoutId = setTimeout(() => {
      timedOut = true;
      setIsLoading(false);
    }, SESSION_TIMEOUT_MS);

    supabase.auth.getSession().then(({ data }) => {
      if (!timedOut) {
        clearTimeout(timeoutId);
        setSession(data.session);
        setIsLoading(false);
      }
    });

    // Keep session in sync with auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: AuthError | null }> => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    },
    []
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const isAdmin = isAdminEmail(session?.user?.email ?? '');

  return (
    <AuthContext.Provider value={{ session, isAdmin, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
