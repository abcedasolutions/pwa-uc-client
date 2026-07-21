import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { AuthUser } from "../api/auth";
import { fetchMe, login as loginApi, logout as logoutApi, registerBusiness as registerApi } from "../api/auth";
import { getAccessToken } from "../api/client";
import { clearAllData, setMeta, getMeta } from "../db/indexedDb";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { businessName: string; adminName: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const CACHED_USER_KEY = "cachedUser";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let settled = false;

    // Kept above apiFetch's own 25s timeout so that one settles first.
    const safetyTimeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        setLoading(false);
      }
    }, 30000);

    (async () => {
      const token = getAccessToken();
      if (!token) {
        if (!settled) {
          settled = true;
          setLoading(false);
        }
        return;
      }
      try {
        const me = await fetchMe();
        if (settled) return;
        setUser(me);
        await setMeta("businessId", me.business.id);
        await setMeta(CACHED_USER_KEY, me);
      } catch {
        // Offline or token invalid on boot: fall back to last-known user so the app shell can still open without connectivity.
        if (settled) return;
        const cached = await getMeta(CACHED_USER_KEY);
        if (!settled && cached) setUser(cached);
      } finally {
        if (!settled) {
          settled = true;
          setLoading(false);
        }
      }
    })();

    return () => clearTimeout(safetyTimeout);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const me = await loginApi({ email, password });
    setUser(me);
    await setMeta("businessId", me.business.id);
    await setMeta(CACHED_USER_KEY, me);
  }, []);

  const register = useCallback(
    async (input: { businessName: string; adminName: string; email: string; password: string }) => {
      const me = await registerApi(input);
      setUser(me);
      await setMeta("businessId", me.business.id);
      await setMeta(CACHED_USER_KEY, me);
    },
    []
  );

  const logout = useCallback(async () => {
    logoutApi();
    setUser(null);
    await clearAllData();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider.");
  return ctx;
}
