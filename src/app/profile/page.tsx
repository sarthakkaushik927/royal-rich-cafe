"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, LogOut, Loader2, Edit3, ShieldCheck, Check, X, Calendar } from "lucide-react";
import { authService } from "@/services/authService";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const { profile, loading, isAuthenticated, signOut, userId } = useAuth();
  const [email, setEmail] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  const [address, setAddress] = useState("");
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!loading && !isAuthenticated) {
      router.push("/auth?redirect=/profile");
    } else if (isAuthenticated) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) setEmail(data.session.user.email ?? null);
      });
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (profile?.address) {
      setAddress(profile.address);
    }
  }, [profile]);

  const handleSaveAddress = async () => {
    if (!userId) return;
    setIsSavingAddress(true);
    try {
      await authService.updateProfile(userId, { address });
      toast.success("Address updated successfully");
      setIsEditingAddress(false);
    } catch (error) {
      toast.error("Failed to save address. Please try again.");
    } finally {
      setIsSavingAddress(false);
    }
  };

  if (!isMounted || loading || (!isAuthenticated && isMounted)) {
    return (
      <div className="min-h-screen bg-[#0D0B09] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#D4A24C] w-8 h-8" />
      </div>
    );
  }

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      toast.error("Failed to sign out");
      setIsSigningOut(false);
    }
  };

  return (
    <div className="bg-[#0D0B09]">
      <section className="pt-32 pb-6 px-6 md:px-12 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-b from-[#141210] to-[#0D0B09] border border-[#D4A24C]/15 rounded-2xl p-8 md:p-12 shadow-2xl"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
            <div className="w-24 h-24 bg-[#D4A24C]/10 rounded-full flex items-center justify-center border border-[#D4A24C]/30 flex-shrink-0">
              <User size={40} className="text-[#D4A24C]" />
            </div>
            
            <div className="text-center md:text-left flex-1">
              <h1 className="font-serif text-3xl md:text-4xl text-[#F7F3EC] mb-2">
                {profile?.full_name || "Valued Guest"}
              </h1>
              <p className="text-[#C7BFB2] mb-4 flex items-center justify-center md:justify-start gap-2">
                <ShieldCheck size={16} className="text-[#D4A24C]" />
                {profile?.role === 'admin' ? 'Administrator' : profile?.role === 'chef' ? 'Head Chef' : 'Customer'}
              </p>
              
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-[#D4A24C]/30 text-sm font-medium text-[#F7F3EC] hover:bg-[#D4A24C]/10 hover:border-[#D4A24C] transition-all disabled:opacity-50"
              >
                {isSigningOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                Sign Out
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-xs uppercase tracking-widest text-[#D4A24C] font-semibold mb-2 flex items-center gap-2">
                  <User size={14} /> Full Name
                </h3>
                <div className="bg-[#0D0B09] border border-[#D4A24C]/10 rounded-lg p-4 text-[#F7F3EC]">
                  {profile?.full_name || "Not provided"}
                </div>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-widest text-[#D4A24C] font-semibold mb-2 flex items-center gap-2">
                  <Mail size={14} /> Email Address
                </h3>
                <div className="bg-[#0D0B09] border border-[#D4A24C]/10 rounded-lg p-4 text-[#F7F3EC]">
                  {email || "Loading..."}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xs uppercase tracking-widest text-[#D4A24C] font-semibold mb-2 flex items-center gap-2">
                  <Phone size={14} /> Phone Number
                </h3>
                <div className="bg-[#0D0B09] border border-[#D4A24C]/10 rounded-lg p-4 text-[#F7F3EC]">
                  {profile?.phone || "Not provided"}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs uppercase tracking-widest text-[#D4A24C] font-semibold flex items-center gap-2">
                    <MapPin size={14} /> Delivery Address
                  </h3>
                  {!isEditingAddress && (
                    <button 
                      onClick={() => setIsEditingAddress(true)}
                      className="text-xs text-[#C7BFB2] hover:text-[#D4A24C] flex items-center gap-1 transition-colors"
                    >
                      <Edit3 size={12} /> Edit
                    </button>
                  )}
                </div>
                
                {isEditingAddress ? (
                  <div className="flex flex-col gap-3">
                    <textarea 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your full delivery address..."
                      className="w-full bg-[#1A1410] border border-[#D4A24C]/30 rounded-lg p-3 text-sm text-[#F7F3EC] focus:border-[#D4A24C] focus:ring-1 focus:ring-[#D4A24C] transition-all min-h-[80px]"
                    />
                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => {
                          setIsEditingAddress(false);
                          setAddress(profile?.address || "");
                        }}
                        className="p-2 border border-[#D4A24C]/30 rounded-md text-[#C7BFB2] hover:text-white hover:bg-white/5 transition-all"
                        disabled={isSavingAddress}
                      >
                        <X size={16} />
                      </button>
                      <button 
                        onClick={handleSaveAddress}
                        className="flex items-center gap-1 px-4 py-2 bg-[#D4A24C] rounded-md text-[#1A1410] font-semibold hover:bg-[#c8963f] transition-all disabled:opacity-50"
                        disabled={isSavingAddress}
                      >
                        {isSavingAddress ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#0D0B09] border border-[#D4A24C]/10 rounded-lg p-4 text-[#F7F3EC] min-h-[56px] flex items-center">
                    {address || <span className="text-[#666]">No address saved yet</span>}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-widest text-[#D4A24C] font-semibold mb-2 flex items-center gap-2">
                  <Calendar size={14} /> Member Since
                </h3>
                <div className="bg-[#0D0B09] border border-[#D4A24C]/10 rounded-lg p-4 text-[#F7F3EC]">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "Unknown"}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
