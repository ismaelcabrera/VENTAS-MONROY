import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  displayName: string;
  loading: boolean;
  loginOpen: boolean;
  setLoginOpen: (open: boolean) => void;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signInWithGoogle: () => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);
  const [profileName, setProfileName] = useState("");

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
      if (next) setLoginOpen(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id;

  useEffect(() => {
    if (!userId) {
      setProfileName("");
      return;
    }
    let active = true;
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (active && data?.display_name) setProfileName(data.display_name);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error) return null;
    return error.message.toLowerCase().includes("invalid")
      ? "Correo o contraseña incorrectos."
      : error.message;
  }, []);

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { display_name: name },
        },
      });
      if (error) {
        return {
          error: error.message.toLowerCase().includes("already")
            ? "Ese correo ya está registrado. Inicia sesión."
            : error.message,
          needsConfirmation: false,
        };
      }
      return { error: null, needsConfirmation: !data.session };
    },
    [],
  );

  const signInWithGoogle = useCallback(async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
    },
  });
  if (error) return error.message;
  return null;
}, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const displayName =
    profileName ||
    (session?.user.user_metadata?.["display_name"] as string | undefined) ||
    session?.user.email?.split("@")[0] ||
    "Vecino";

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      displayName,
      loading,
      loginOpen,
      setLoginOpen,
      signIn,
      signUp,
      signInWithGoogle,
      logout,
    }),
    [
      session,
      displayName,
      loading,
      loginOpen,
      signIn,
      signUp,
      signInWithGoogle,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
