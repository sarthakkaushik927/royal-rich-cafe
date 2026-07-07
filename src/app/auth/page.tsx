'use client';

import { useState, Suspense } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowRight, ShieldCheck, Lock, Eye, EyeOff } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

type AuthMode = 'login' | 'signup' | 'forgot_password' | 'verify_email' | 'otp_request' | 'magic_link_sent';

function AuthContent() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [address, setAddress] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [roleMode, setRoleMode] = useState<'customer' | 'admin' | 'chef' | 'waiter'>('customer');
  const [isUploading, setIsUploading] = useState(false);


  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';


  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');

    setLoading(true);
    const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`;

    if (mode === 'signup') {
      if (!password || password.length < 6) {
        setLoading(false);
        return toast.error('Password must be at least 6 characters');
      }

      if (!fullName) {
        setLoading(false);
        return toast.error('Please enter your full name');
      }

      if (!phone || phone.length < 10) {
        setLoading(false);
        return toast.error('Please enter a valid phone number');
      }
      let avatarUrl = '';
      if (avatarFile) {
        setIsUploading(true);
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile);
        
        if (uploadError) {
          toast.error('Failed to upload image');
          setLoading(false);
          setIsUploading(false);
          return;
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        
        avatarUrl = publicUrl;
        setIsUploading(false);
      }

      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            phone: phone,
            requested_role: roleMode,
            address: address,
            avatar_url: avatarUrl
          }
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Signup successful! Please check your email to confirm your account.');
        setMode('verify_email');
      }
    } else if (mode === 'login') {
      if (!password) {
        setLoading(false);
        return toast.error('Please enter your password');
      }

      const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          toast.error('Please verify your email address first.');
          setMode('verify_email');
        } else {
          toast.error('Invalid email or password');
        }
      } else if (signInData.user) {
        // Check profile status
        const { data: profile } = await supabase.from('profiles').select('status, role').eq('id', signInData.user.id).single();
        if (profile?.status === 'pending') {
          await supabase.auth.signOut();
          toast.error('Your account is pending admin approval.');
          return;
        }
        if (profile?.status === 'rejected') {
          await supabase.auth.signOut();
          toast.error('Your account request was rejected.');
          return;
        }

        toast.success('Successfully logged in!');
        router.replace(redirectTo);
      }
    } else if (mode === 'forgot_password') {
      const resetUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent('/auth/update-password')}`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetUrl,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Password reset link sent to your email!');
        setMode('login');
      }
    }
    setLoading(false);
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`;

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: redirectUrl }
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Verification link resent!');
      // Simple cooldown
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');

    setLoading(true);
    const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`;
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectUrl },
    });

    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Magic link sent to your email!');
      setMode('magic_link_sent');
    }
  };

  const renderTitle = () => {
    switch (mode) {
      case 'login': return 'Welcome Back';
      case 'signup': return 'Create Account';
      case 'forgot_password': return 'Reset Password';
      case 'verify_email': return 'Check Your Email';
      case 'otp_request': return 'Magic Link Login';
      case 'magic_link_sent': return 'Check Your Email';
    }
  };

  const renderSubtitle = () => {
    switch (mode) {
      case 'login': return 'Enter your details to access your account';
      case 'signup': return 'Join Royal Rich Café for luxury dining';
      case 'forgot_password': return 'We will send you a reset link';
      case 'verify_email': return 'We sent a verification link to your email';
      case 'otp_request': return 'Get a secure link sent to your email';
      case 'magic_link_sent': return 'We sent a magic link to your email';
    }
  };

  return (
    <main className="min-h-screen bg-[#1C1C1E] text-white font-sans flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center p-6 pt-24 pb-24">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">{renderTitle()}</h1>
            <p className="text-gray-400">{renderSubtitle()}</p>
          </div>

          {(mode === 'login' || mode === 'signup') && (
            <div className="flex gap-2 mb-6 bg-[#2C2C2E] p-1 rounded-xl">
              <button
                onClick={() => setRoleMode('customer')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${roleMode === 'customer' ? 'bg-[#fba93b] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
              >
                Customer
              </button>
              <button
                onClick={() => setRoleMode('chef')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${roleMode === 'chef' ? 'bg-[#fba93b] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
              >
                Kitchen
              </button>
              <button
                onClick={() => setRoleMode('waiter')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${roleMode === 'waiter' ? 'bg-[#fba93b] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
              >
                Waiter
              </button>
              <button
                onClick={() => setRoleMode('admin')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${roleMode === 'admin' ? 'bg-[#fba93b] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
              >
                Admin
              </button>
            </div>
          )}

          <div className="bg-[#2C2C2E] border border-gray-700 p-6 md:p-8 rounded-3xl shadow-xl">
            {mode === 'verify_email' ? (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-[#fba93b]/20 text-[#fba93b] rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck size={32} />
                </div>
                <p className="text-sm text-gray-300">
                  Please check your inbox at <span className="text-[#fba93b] font-medium">{email}</span> and click the secure link to verify your account.
                </p>
                <div className="pt-4 flex flex-col gap-3">
                  <button
                    onClick={handleResendVerification}
                    disabled={loading || resendCooldown > 0}
                    className="w-full h-12 bg-[#fba93b] text-black font-bold rounded-xl hover:bg-[#c8963f] transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin mx-auto" /> : 
                     resendCooldown > 0 ? `Resend available in ${resendCooldown}s` : 'Resend Link'}
                  </button>
                  <button
                    onClick={() => setMode('login')}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            ) : mode === 'magic_link_sent' ? (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-[#fba93b]/20 text-[#fba93b] rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck size={32} />
                </div>
                <p className="text-sm text-gray-300">
                  We sent a secure link to <br/>
                  <span className="text-[#fba93b] font-medium">{email}</span>
                </p>
                <p className="text-sm text-gray-400">
                  Click the link in the email to instantly log in to your account.
                </p>
                <div className="flex flex-col gap-3 mt-6">
                  <button type="button" onClick={() => setMode('otp_request')} className="text-sm text-[#fba93b] hover:text-white transition-colors">
                    Use a different email
                  </button>
                  <button type="button" onClick={() => setMode('login')} className="text-sm text-gray-400 hover:text-white transition-colors">
                    Back to password login
                  </button>
                </div>
              </div>
            ) : (
              <motion.form 
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={mode === 'otp_request' ? handleSendOTP : handleAuth}
                className="space-y-5"
              >
                {mode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full h-12 bg-[#1C1C1E] border border-gray-600 rounded-xl px-4 text-white placeholder-gray-500 focus:border-[#fba93b] focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full h-12 bg-[#1C1C1E] border border-gray-600 rounded-xl px-4 text-white placeholder-gray-500 focus:border-[#fba93b] focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                    {roleMode !== 'customer' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              placeholder="123 Main St"
                              className="w-full h-12 bg-[#1C1C1E] border border-gray-600 rounded-xl px-4 text-white placeholder-gray-500 focus:border-[#fba93b] focus:outline-none transition-colors"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Employee Photo</label>
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              required
                              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                              className="w-full bg-[#1C1C1E] border border-gray-600 rounded-xl px-4 py-2.5 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#fba93b] file:text-black hover:file:bg-[#c8963f] focus:border-[#fba93b] focus:outline-none transition-colors"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="hello@example.com"
                      className="w-full h-12 bg-[#1C1C1E] border border-gray-600 rounded-xl pl-11 pr-4 text-white placeholder-gray-500 focus:border-[#fba93b] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {mode !== 'forgot_password' && mode !== 'otp_request' && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-300">Password</label>
                      {mode === 'login' && (
                        <button type="button" onClick={() => setMode('forgot_password')} className="text-xs text-[#fba93b] hover:underline">
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-12 bg-[#1C1C1E] border border-gray-600 rounded-xl pl-11 pr-11 text-white placeholder-gray-500 focus:border-[#fba93b] focus:outline-none transition-colors"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#fba93b] text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#c8963f] hover:scale-[1.02] transition-all disabled:opacity-70 disabled:hover:scale-100 mt-6"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : mode === 'otp_request' ? 'Send Magic Link' : 'Send Reset Link'} 
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
                
                <div className="pt-4 text-center">
                  {mode === 'login' ? (
                    <>
                      <p className="text-sm text-gray-400">
                        Don't have an account?{' '}
                        <button type="button" onClick={() => setMode('signup')} className="text-[#fba93b] font-semibold hover:underline">
                          Sign up
                        </button>
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        Or{' '}
                        <button type="button" onClick={() => setMode('otp_request')} className="text-[#fba93b] font-semibold hover:underline">
                          login with Magic Link
                        </button>
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400">
                      Back to{' '}
                      <button type="button" onClick={() => setMode('login')} className="text-[#fba93b] font-semibold hover:underline">
                        Sign in
                      </button>
                    </p>
                  )}
                </div>
              </motion.form>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1C1C1E] flex items-center justify-center"><Loader2 className="animate-spin text-[#fba93b]" /></div>}>
      <AuthContent />
    </Suspense>
  );
}
