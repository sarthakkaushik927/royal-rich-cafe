"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  UtensilsCrossed,
  Package,
  Coins,
  QrCode,
} from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { QRScanner } from "@/components/ui/QRScanner";
import { useCartStore } from "@/hooks/useCartStore";
import { useAuth } from "@/hooks/useAuth";
import {
  createPaymentOrder,
  verifyPaymentAction,
  simulateMockPaymentAction,
} from "@/app/actions/order";
import Script from "next/script";
import {
  CheckoutFormSchema,
  type CheckoutFormData,
  type OrderType,
} from "@/lib/types";

const orderTypeConfig: {
  value: OrderType;
  label: string;
  icon: typeof UtensilsCrossed;
}[] = [
  { value: "dine_in", label: "Dine In", icon: UtensilsCrossed },
  { value: "takeaway", label: "Takeaway", icon: Package },
  { value: "delivery", label: "Delivery", icon: MapPin },
];

const sizeLabels = { small: "S", medium: "M", large: "L" } as const;

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableNum = searchParams.get('table');
  const items = useCartStore((s) => s.items);
  const totalAmount = useCartStore((s) => s.totalAmount());
  const clearCart = useCartStore((s) => s.clearCart);
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated, loading, userId, userEmail, profile } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [applyCoins, setApplyCoins] = useState(false);

  const [showScanner, setShowScanner] = useState(false);
  const [earnedCoinsPopup, setEarnedCoinsPopup] = useState<{
    amount: number;
    trackingToken: string;
  } | null>(null);

  const coinsAvailable = profile?.loyalty_coins || 0;
  const canApplyCoins = coinsAvailable >= 100;

  let coinsToUse = 0;
  let discountAmount = 0;
  if (applyCoins && canApplyCoins) {
    const rawDiscount = coinsAvailable * 0.01;
    if (rawDiscount > totalAmount) {
      discountAmount = totalAmount;
      coinsToUse = totalAmount / 0.01;
    } else {
      discountAmount = rawDiscount;
      coinsToUse = coinsAvailable;
    }
  }
  const finalTotal = Math.max(0, totalAmount - discountAmount);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(CheckoutFormSchema),
    defaultValues: {
      guest_name: "",
      guest_phone: "",
      order_type: tableNum ? "dine_in" : "dine_in",
      table_number: tableNum || "",
      delivery_address: "",
    },
  });

  const orderType = watch("order_type");

  useEffect(() => {
    setIsMounted(true);
    
    // Auto-fill table from session storage if available
    const savedTable = sessionStorage.getItem('royal_rich_table');
    if (savedTable && !tableNum && orderType === 'dine_in') {
      setValue("table_number", savedTable);
    }

    if (!loading && !isAuthenticated) {
      router.replace("/auth?redirect=/checkout");
    }
  }, [loading, isAuthenticated, router, tableNum, orderType, setValue]);

  if (!isMounted || loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0D0B09] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#D4A24C] w-8 h-8" />
      </div>
    );
  }

  const handleScan = (decodedText: string) => {
    try {
      const url = new URL(decodedText);
      const scannedTableNum = url.searchParams.get("table");
      if (scannedTableNum) {
        setValue("table_number", scannedTableNum);
        toast.success(`Table ${scannedTableNum} scanned successfully!`);
      } else {
        toast.error("Invalid table QR code");
      }
    } catch (e) {
      toast.error("Invalid QR code format");
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setSubmitting(true);
    try {
      const { data: sessionData } = await import('@/lib/supabaseClient').then(m => m.supabase.auth.getSession());
      const accessToken = sessionData?.session?.access_token;

      const { order, razorpay_order_id, payment_mode } =
        await createPaymentOrder(
          JSON.parse(JSON.stringify({
            customer_id: userId || null,
            guest_name: data.guest_name,
            guest_phone: data.guest_phone,
            order_type: data.order_type,
            table_number: data.table_number || null,
            delivery_address: data.delivery_address || null,
            total_amount: finalTotal,
          })),
          JSON.parse(JSON.stringify(items)),
          coinsToUse,
          Math.floor(finalTotal),
          accessToken || null
        );



      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(finalTotal * 100),
        currency: "INR",
        name: "Royal Rich Cafe",
        description: "Food Order",
        order_id: razorpay_order_id,
        handler: async function (response: any) {
          try {
            const isValid = await verifyPaymentAction({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: order.id,
              customer_id: userId || null,
              earned_coins: Math.floor(finalTotal),
              applied_coins: coinsToUse,
            });

            if (isValid) {
              clearCart();
              const storedTokens = localStorage.getItem("royal_cafe_orders");
              const tokens = storedTokens ? JSON.parse(storedTokens) : [];
              tokens.push(order.tracking_token);
              localStorage.setItem("royal_cafe_orders", JSON.stringify(tokens));

              if (userId && Math.floor(finalTotal) > 0) {
                setEarnedCoinsPopup({
                  amount: Math.floor(finalTotal),
                  trackingToken: order.tracking_token,
                });
              } else {
                toast.success("Order placed successfully!");
                router.push(`/order/${order.tracking_token}`);
              }
            } else {
              toast.error("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            console.error("Payment verification error:", err);
            toast.error("An error occurred during verification. Please contact support.");
          }
        },
        prefill: {
          name: data.guest_name,
          email: userEmail || "",
          contact: data.guest_phone,
        },
        theme: {
          color: "#D4A24C",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error("Payment failed: " + response.error.description);
        setSubmitting(false);
      });
      rzp.open();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to place order");
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#0D0B09] flex flex-col items-center justify-center text-center px-6">
        <h2 className="font-serif text-2xl text-[#F7F3EC] mb-3">
          Cart is empty
        </h2>
          <p className="text-[#C7BFB2] mb-6">
            Add items from the menu before checking out
          </p>
          <Link
            href="/menu"
            className="rounded-[4px] bg-[#D4A24C] px-6 py-3 font-medium text-[#1A1410] hover:bg-[#c8963f] transition-colors"
          >
            Browse Menu
          </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0D0B09] pt-24 pb-12">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      {showScanner && (
        <QRScanner
          onClose={() => setShowScanner(false)}
          onScan={handleScan}
        />
      )}

      <section className="pt-24 pb-6 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-serif text-4xl text-[#F7F3EC] mb-2">
              Checkout
            </h1>
            <p className="text-[#C7BFB2]">Complete your order details</p>
          </motion.div>
        </div>
      </section>

      <section className="px-6 md:px-12 pb-24">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Form fields */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-lg border border-[#D4A24C]/15 bg-linear-to-b from-[#141210] to-[#0D0B09] p-6"
            >
              <h2 className="font-serif text-lg text-[#F7F3EC] mb-4">
                Contact Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#C7BFB2] mb-1.5">
                    Name *
                  </label>
                  <input
                    {...register("guest_name")}
                    className="w-full h-11 rounded-lg border border-[#D4A24C]/15 bg-transparent px-4 text-sm text-[#F7F3EC] placeholder:text-[#C7BFB2]/40 outline-none focus:border-[#D4A24C]/40 transition-colors"
                    placeholder="Your name"
                  />
                  {errors.guest_name && (
                    <p className="mt-1 text-xs text-red-400">
                      {errors.guest_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#C7BFB2] mb-1.5">
                    Phone *
                  </label>
                  <input
                    {...register("guest_phone")}
                    className="w-full h-11 rounded-lg border border-[#D4A24C]/15 bg-transparent px-4 text-sm text-[#F7F3EC] placeholder:text-[#C7BFB2]/40 outline-none focus:border-[#D4A24C]/40 transition-colors"
                    placeholder="+91 98765 43210"
                  />
                  {errors.guest_phone && (
                    <p className="mt-1 text-xs text-red-400">
                      {errors.guest_phone.message}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Order type */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-lg border border-[#D4A24C]/15 bg-linear-to-b from-[#141210] to-[#0D0B09] p-6"
            >
              <h2 className="font-serif text-lg text-[#F7F3EC] mb-4">
                Order Type
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {orderTypeConfig.map((opt) => {
                  const isActive = orderType === opt.value;
                  const Icon = opt.icon;
                  return (
                    <label
                      key={opt.value}
                      className={`flex flex-col items-center gap-2 cursor-pointer rounded-lg border p-4 text-center transition-all ${
                        isActive
                          ? "border-[#D4A24C] bg-[#D4A24C]/10 text-[#D4A24C]"
                          : "border-[#D4A24C]/15 text-[#C7BFB2] hover:border-[#D4A24C]/30"
                      }`}
                    >
                      <input
                        type="radio"
                        value={opt.value}
                        {...register("order_type")}
                        className="sr-only"
                      />
                      <Icon size={20} />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </label>
                  );
                })}
              </div>

              {orderType === "dine_in" && (
                <div className="mt-4">
                  <label className="block text-xs uppercase tracking-widest text-[#C7BFB2] mb-1.5">
                    Table Number
                  </label>
                  <div className="flex gap-2">
                    <input
                      {...register("table_number")}
                      className="w-full h-11 rounded-lg border border-[#D4A24C]/15 bg-transparent px-4 text-sm text-[#F7F3EC] placeholder:text-[#C7BFB2]/40 outline-none focus:border-[#D4A24C]/40 transition-colors"
                      placeholder="e.g. Table 5"
                    />
                    <button
                      type="button"
                      onClick={() => setShowScanner(true)}
                      className="h-11 px-4 flex items-center justify-center gap-2 bg-[#D4A24C]/10 border border-[#D4A24C]/30 text-[#D4A24C] rounded-lg hover:bg-[#D4A24C]/20 transition-colors shrink-0"
                    >
                      <QrCode size={18} />
                      <span className="hidden sm:inline text-sm font-medium">Scan QR</span>
                    </button>
                  </div>
                </div>
              )}

              {orderType === "delivery" && (
                <div className="mt-4">
                  <label className="block text-xs uppercase tracking-widest text-[#C7BFB2] mb-1.5">
                    Delivery Address *
                  </label>
                  <textarea
                    {...register("delivery_address")}
                    rows={3}
                    className="w-full rounded-lg border border-[#D4A24C]/15 bg-transparent px-4 py-3 text-sm text-[#F7F3EC] placeholder:text-[#C7BFB2]/40 outline-none focus:border-[#D4A24C]/40 transition-colors resize-none"
                    placeholder="Full delivery address"
                  />
                </div>
              )}
            </motion.div>
          </div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="h-fit rounded-lg border border-[#D4A24C]/15 bg-linear-to-b from-[#141210] to-[#0D0B09] p-6"
          >
            <h2 className="font-serif text-lg text-[#F7F3EC] mb-4">
              Order Summary
            </h2>
            <div className="space-y-2 border-b border-[#D4A24C]/10 pb-4 mb-4">
              {items.map((item) => (
                <div
                  key={`${item.food_item_id}-${item.size}`}
                  className="flex justify-between text-sm"
                >
                  <span className="text-[#C7BFB2] truncate mr-2">
                    {item.name} ({sizeLabels[item.size]}) × {item.quantity}
                  </span>
                  <span className="text-[#F7F3EC] shrink-0">
                    ₹{(item.unit_price * item.quantity).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>

            {isAuthenticated && profile && (
              <div className="mb-6 p-4 rounded-lg bg-[#D4A24C]/5 border border-[#D4A24C]/20">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="text-[#D4A24C]" size={20} />
                    <div>
                      <p className="text-sm font-medium text-[#F7F3EC]">
                        Royal Coins
                      </p>
                      <p className="text-xs text-[#C7BFB2]">
                        Balance: {coinsAvailable} coins
                      </p>
                    </div>
                  </div>
                  {canApplyCoins ? (
                    <button
                      type="button"
                      onClick={() => setApplyCoins(!applyCoins)}
                      className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                        applyCoins
                          ? "bg-[#D4A24C] text-[#1A1410] font-medium"
                          : "border border-[#D4A24C] text-[#D4A24C] hover:bg-[#D4A24C]/10"
                      }`}
                    >
                      {applyCoins ? "Applied" : "Apply"}
                    </button>
                  ) : (
                    <span className="text-[10px] uppercase tracking-wider text-[#C7BFB2]/50 bg-[#C7BFB2]/10 px-2 py-1 rounded">
                      Min 100 req
                    </span>
                  )}
                </div>
                {applyCoins && canApplyCoins && (
                  <div className="mt-3 pt-3 border-t border-[#D4A24C]/10 flex justify-between text-sm">
                    <span className="text-[#D4A24C]">Coin Discount</span>
                    <span className="text-[#D4A24C]">
                      -₹{discountAmount.toFixed(0)}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between items-center mb-6">
              <span className="text-[#C7BFB2] font-medium">Total</span>
              <span className="text-2xl font-serif text-[#D4A24C]">
                ₹{finalTotal.toFixed(0)}
              </span>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-[4px] bg-[#D4A24C] px-6 py-3 font-medium text-[#1A1410] hover:bg-[#c8963f] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Placing Order...
                </>
              ) : (
                "Place Order"
              )}
            </button>
          </motion.div>
        </form>
      </section>

      {/* Earned Coins Celebration Popup */}
      {earnedCoinsPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#141210] border-2 border-[#D4A24C] rounded-2xl p-8 max-w-sm w-full text-center relative overflow-hidden"
          >
            {/* Sparkle effects */}
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -top-20 -right-20 w-40 h-40 bg-[#D4A24C]/20 blur-3xl rounded-full pointer-events-none"
            />
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#D4A24C]/10 blur-3xl rounded-full pointer-events-none"
            />

            <h2 className="font-serif text-3xl text-[#D4A24C] mb-2 font-bold drop-shadow-md">
              Congratulations!
            </h2>
            <p className="text-[#F7F3EC] mb-6 text-lg">
              You just earned{" "}
              <span className="font-bold text-[#D4A24C] text-2xl mx-1">
                {earnedCoinsPopup.amount}
              </span>{" "}
              Royal Coins on this order!
            </p>
            
            <button
              onClick={() => {
                setEarnedCoinsPopup(null);
                router.push(`/order/${earnedCoinsPopup.trackingToken}`);
              }}
              className="w-full bg-gradient-to-r from-[#D4A24C] to-[#b38332] text-[#1A1410] font-bold py-3 rounded hover:shadow-[0_0_15px_rgba(212,162,76,0.5)] transition-all"
            >
              View My Order
            </button>
          </motion.div>
        </div>
      )}
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0D0B09] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#D4A24C]" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
