import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ApiError, staffApi, type Staff } from "./api";

interface StaffState {
  /** undefined = not checked yet; null = not logged in. */
  staff: Staff | null | undefined;
  loading: boolean;
  refresh: () => Promise<Staff | null>;
  setStaff: (s: Staff | null) => void;
  logout: () => Promise<void>;
}

const Ctx = createContext<StaffState | null>(null);

export function StaffProvider({ children }: { children: ReactNode }) {
  const [staff, setStaffState] = useState<Staff | null | undefined>(undefined);
  // Sequence guard: a /me request that started before a later setStaff (e.g.
  // the 401 in flight while the verify page logs you in) must not win.
  const seq = useRef(0);

  const setStaff = useCallback((s: Staff | null) => {
    seq.current += 1;
    setStaffState(s);
  }, []);

  const refresh = useCallback(async () => {
    const mine = ++seq.current;
    try {
      const { staff } = await staffApi.me();
      if (mine === seq.current) setStaffState(staff);
      return staff;
    } catch (err) {
      if (mine !== seq.current) return null;
      if (err instanceof ApiError && err.status === 401) {
        setStaffState(null);
        return null;
      }
      // Network / server trouble: leave the previous value, but stop "loading".
      setStaffState((prev) => (prev === undefined ? null : prev));
      return null;
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await staffApi.logout();
    } finally {
      setStaff(null);
    }
  }, [setStaff]);

  const value = useMemo<StaffState>(
    () => ({ staff, loading: staff === undefined, refresh, setStaff, logout }),
    [staff, refresh, setStaff, logout],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStaff(): StaffState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStaff must be used inside <StaffProvider>");
  return v;
}
