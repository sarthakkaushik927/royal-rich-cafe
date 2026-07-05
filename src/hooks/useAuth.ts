"use client";
import { useEffect, useState, useCallback } from 'react';
import { authService } from '@/services/authService';
import type { Profile } from '@/lib/types';

export function useAuth() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getSession().then((session) => {
      // getSession currently only returns userId. Let's fix authService to return email or we can use supabase directly here
      // But authService is defined in another file. Let's just fetch it here
      import('@/lib/supabaseClient').then(({ supabase }) => {
        supabase.auth.getSession().then(({ data }) => {
          setUserId(data.session?.user?.id ?? null);
          setUserEmail(data.session?.user?.email ?? null);
          setLoading(false);
        });
      });
    });

    const unsub = authService.onAuthChange((id) => {
      if (!id) {
        setUserId(null);
        setUserEmail(null);
        setProfile(null);
      } else {
        setUserId(id);
        import('@/lib/supabaseClient').then(({ supabase }) => {
          supabase.auth.getUser().then(({ data }) => {
            setUserEmail(data.user?.email ?? null);
          });
        });
      }
    });

    return unsub;
  }, []);

  useEffect(() => {
    if (!userId) return;
    authService.getProfile(userId).then(setProfile).catch(() => setProfile(null));
  }, [userId]);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await authService.signIn(email, password);
    setUserId(result.userId);
    setUserEmail(email);
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setUserId(null);
    setUserEmail(null);
    setProfile(null);
  }, []);

  return { userId, userEmail, profile, loading, signIn, signOut, isAuthenticated: !!userId };
}
