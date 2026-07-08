"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChefHat, Diamond, ArrowRight, Loader2 } from 'lucide-react';
import { authService } from '@/services/authService';

export default function Page() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.signIn(email, password);
      // Wait a moment for auth state to propagate if needed, then navigate
      navigate.replace('/chef');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0D0B09] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4A24C]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#D4A24C]/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Diamond size={32} className="text-[#D4A24C]" />
              <div className="absolute -inset-4 bg-[#D4A24C]/10 rounded-full blur-xl -z-10" />
            </div>
          </div>
          <h1 className="font-serif text-3xl text-[#F7F3EC] mb-2 tracking-wide">
            Kitchen Portal
          </h1>
          <p className="text-[#C7BFB2] text-sm uppercase tracking-widest">
            Royal Rich Café Staff
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-linear-to-b from-[#141210] to-[#0D0B09] border border-[#D4A24C]/15 rounded-2xl p-8 shadow-2xl backdrop-blur-sm"
        >
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#C7BFB2] mb-2">
                Staff Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 rounded-lg border border-[#D4A24C]/15 bg-[#0D0B09]/50 px-4 text-[#F7F3EC] placeholder:text-[#C7BFB2]/30 outline-none focus:border-[#D4A24C]/40 transition-colors"
                placeholder="chef@royalrich.com"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#C7BFB2] mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-12 rounded-lg border border-[#D4A24C]/15 bg-[#0D0B09]/50 px-4 text-[#F7F3EC] placeholder:text-[#C7BFB2]/30 outline-none focus:border-[#D4A24C]/40 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-[#D4A24C] h-12 font-medium text-[#1A1410] hover:bg-[#c8963f] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <ChefHat size={18} />
                Access Kitchen
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-[#C7BFB2]/50">
          Secure staff portal. Authorized personnel only.
        </div>
      </motion.div>
    </main>
  );
}
