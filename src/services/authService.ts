import { supabase } from '@/lib/supabaseClient';
import type { Profile } from '@/lib/types';

export interface AuthService {
  signIn(email: string, password: string): Promise<{ userId: string }>;
  signUp(email: string, password: string, fullName: string): Promise<{ userId: string }>;
  signOut(): Promise<void>;
  getSession(): Promise<{ userId: string } | null>;
  getProfile(userId: string): Promise<Profile>;
  updateProfile(userId: string, updates: Partial<Profile>): Promise<void>;
  onAuthChange(callback: (userId: string | null) => void): () => void;
}

export const authService: AuthService = {
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return { userId: data.user.id };
  },

  async signUp(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Sign-up failed');
    return { userId: data.user.id };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  async getSession() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return null;
    return { userId: data.session.user.id };
  },

  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw new Error(error.message);
    return data as Profile;
  },

  async updateProfile(userId, updates) {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    if (error) throw new Error(error.message);
  },

  onAuthChange(callback) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user?.id ?? null);
    });
    return () => data.subscription.unsubscribe();
  },
};
