"use client";

import { useAuth } from "@/hooks/useAuth";
import { Loader2, Settings, ShieldAlert, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminSettingsPage() {
  const { profile, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4A24C]" />
      </div>
    );
  }

  if (profile?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-[#C7BFB2]">
        <ShieldAlert className="h-12 w-12 mb-4 text-red-500/80" />
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif text-[#F7F3EC] mb-2 flex items-center gap-2">
          <Settings className="text-[#D4A24C]" />
          Platform Settings
        </h1>
        <p className="text-[#C7BFB2] text-sm">
          Manage global application settings and integrations.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#141210] border border-[#D4A24C]/20 rounded-xl p-6 max-w-2xl"
      >
        <h2 className="text-lg font-medium text-[#F7F3EC] mb-4">
          Payment Gateway
        </h2>

        <div className="flex items-center justify-between p-4 bg-[#0D0B09] rounded-lg border border-[#D4A24C]/10 mb-6">
          <div>
            <h3 className="font-medium text-[#F7F3EC]">Razorpay Checkout</h3>
            <p className="text-sm text-[#C7BFB2] mt-1">
              Live payment gateway is permanently enabled. Test cards and Netbanking options are handled natively through your Razorpay dashboard test credentials.
            </p>
          </div>

          <div className="flex items-center gap-2 ml-4 shrink-0 px-4 py-2 bg-emerald-950/30 border border-emerald-900/50 rounded-md">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span className="text-emerald-400 text-sm font-medium tracking-wide">
              ACTIVE
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
