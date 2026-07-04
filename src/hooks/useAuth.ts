"use client";
import { useEffect, useState, useCallback } from 'react';
import { authService } from '@/services/authService';
import type { Profile } from '@/lib/types';

export function useAuth() {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getSession().then((session) => {
      setUserId(session?.userId ?? null);
      setLoading(false);
    });

    const unsub = authService.onAuthChange((id) => {
      setUserId(id);
      if (!id) setProfile(null);
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
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setUserId(null);
    setProfile(null);
  }, []);

  return { userId, profile, loading, signIn, signOut, isAuthenticated: !!userId };
}
