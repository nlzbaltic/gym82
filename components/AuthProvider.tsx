'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { openedFromRecoveryLink, supabase } from '@/lib/supabase';

export type Profile = { full_name: string; phone: string };

type AuthState = {
 ready: boolean;
 session: Session | null;
 user: User | null;
 profile: Profile | null;
 firstName: string;
 recovery: boolean;
 refreshProfile: () => Promise<void>;
 signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
 const [ready, setReady] = useState(!supabase);
 const [session, setSession] = useState<Session | null>(null);
 const [profile, setProfile] = useState<Profile | null>(null);
 const [recovery, setRecovery] = useState(false);
 const user = session?.user ?? null;
 const userId = user?.id;

 useEffect(() => {
  if (openedFromRecoveryLink) setRecovery(true);
  if (!supabase) return;
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, next) => {
   if (event === 'PASSWORD_RECOVERY') setRecovery(true);
   if (event === 'SIGNED_OUT') setRecovery(false);
   setSession(next);
   setReady(true);
  });
  return () => subscription.unsubscribe();
 }, []);

 const refreshProfile = useCallback(async () => {
  if (!supabase || !userId) { setProfile(null); return; }
  const { data } = await supabase.from('profiles').select('full_name, phone').eq('id', userId).maybeSingle();
  setProfile({ full_name: data?.full_name ?? '', phone: data?.phone ?? '' });
 }, [userId]);

 useEffect(() => { refreshProfile(); }, [refreshProfile]);

 const signOut = useCallback(async () => {
  await supabase?.auth.signOut();
  setProfile(null);
 }, []);

 const metaName = typeof user?.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : '';
 const firstName = (profile?.full_name || metaName).trim().split(/\s+/)[0] || '';

 return <AuthContext.Provider value={{ ready, session, user, profile, firstName, recovery, refreshProfile, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
 const ctx = useContext(AuthContext);
 if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
 return ctx;
}
