"use client";
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, CheckCircle2, ChefHat, PackageCheck, CircleDot, XCircle, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Skeleton } from '@/components/ui/Skeleton';
import { useOrderByToken, useOrderRealtime } from '@/hooks/useOrderData';
import { orderService } from '@/services/orderService';
import type { OrderStatus } from '@/lib/types';

const steps: { status: OrderStatus; label: string; icon: typeof Clock }[] = [
  { status: 'pending', label: 'Pending', icon: Clock },
  { status: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { status: 'preparing', label: 'Preparing', icon: ChefHat },
  { status: 'ready', label: 'Ready', icon: PackageCheck },
  { status: 'completed', label: 'Completed', icon: CircleDot },
];

function getStepIndex(status: OrderStatus): number {
  if (status === 'cancelled') return -1;
  return steps.findIndex((s) => s.status === status);
}

const sizeLabels = { small: 'S', medium: 'M', large: 'L' } as const;

function OrderReceipt({ order }: { order: any }) {
  const handlePrint = () => {
    window.print();
  };

  const gst = order.total_amount * 0.05;
  const subtotal = order.total_amount - gst;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-6 rounded-lg border border-[#D4A24C]/30 bg-[#FAF8F5] p-8 text-[#1A1410] relative overflow-hidden shadow-2xl receipt-container"
    >
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          nav, footer, .no-print, button, a {
            display: none !important;
          }
          body, main, section, html, #root, .receipt-container {
            background: white !important;
            color: black !important;
            min-height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          #receipt-print-area {
            display: block !important;
            padding: 20px !important;
          }
        }
      `}} />

      <div className="absolute top-0 left-0 right-0 h-1 bg-[radial-gradient(circle_at_bottom,#FAF8F5_4px,transparent_5px)] bg-[length:10px_4px] bg-repeat-x bg-white" />

      <div id="receipt-print-area" className="font-mono text-xs text-left">
        <div className="text-center mb-6">
          <h3 className="font-serif text-xl tracking-widest font-bold uppercase text-[#D4A24C] mb-1">
            Royal Rich Café
          </h3>
          <p className="text-[10px] uppercase tracking-wider text-gray-500">
            A Luxury Culinary Experience
          </p>
          <p className="text-[9px] text-gray-400 mt-1">
            12 Luxury Boulevard, Chanakyapuri, New Delhi
          </p>
          <p className="text-[9px] text-gray-400">
            Tel: +91 11 4987 6543
          </p>
        </div>

        <div className="border-b border-dashed border-gray-300 my-4" />

        <div className="grid grid-cols-2 gap-y-1 mb-4 text-[10px] text-gray-600">
          <div>ORDER ID:</div>
          <div className="text-right font-bold text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</div>
          <div>DATE:</div>
          <div className="text-right">{new Date(order.created_at).toLocaleString()}</div>
          <div>TYPE:</div>
          <div className="text-right capitalize">{order.order_type.replace('_', ' ')}</div>
          {order.table_number && (
            <>
              <div>TABLE NO:</div>
              <div className="text-right">{order.table_number}</div>
            </>
          )}
          {order.guest_name && (
            <>
              <div>CUSTOMER:</div>
              <div className="text-right font-medium text-gray-800">{order.guest_name}</div>
            </>
          )}
        </div>

        <div className="border-b border-dashed border-gray-300 my-4" />

        <div className="grid grid-cols-4 font-bold text-gray-700 text-[10px] mb-2">
          <div className="col-span-2">ITEM</div>
          <div className="text-center">QTY</div>
          <div className="text-right">PRICE</div>
        </div>

        <div className="space-y-2 mb-4 text-[10px] text-gray-600">
          {order.items?.map((item: any) => (
            <div key={item.id} className="grid grid-cols-4 items-start">
              <div className="col-span-2">
                <span className="font-medium text-gray-800">
                  {item.food_item?.name ?? 'Item'}
                </span>
                <span className="text-[9px] text-gray-400 block capitalize">
                  Size: {item.size}
                </span>
              </div>
              <div className="text-center">{item.quantity}</div>
              <div className="text-right">₹{item.subtotal.toFixed(0)}</div>
            </div>
          ))}
        </div>

        <div className="border-b border-dashed border-gray-300 my-4" />

        <div className="space-y-1.5 text-[10px] text-gray-600">
          <div className="flex justify-between">
            <span>SUBTOTAL:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>GST (5%):</span>
            <span>₹{gst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 text-sm pt-1 border-t border-dotted border-gray-200">
            <span>TOTAL PAID:</span>
            <span>₹{order.total_amount.toFixed(0)}</span>
          </div>
        </div>

        <div className="border-b border-dashed border-gray-300 my-4" />

        <div className="text-center space-y-1 text-gray-400 text-[9px] mt-4">
          <p className="font-medium text-gray-600 uppercase tracking-widest">
            Thank you for dining with us!
          </p>
          <p>Your culinary journey awaits. See you again.</p>
        </div>
      </div>

      <div className="mt-6 flex justify-center no-print">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-lg bg-[#D4A24C] hover:bg-[#c8963f] px-6 py-2.5 text-sm font-semibold text-[#1A1410] transition-colors shadow-lg shadow-[#D4A24C]/10"
        >
          Print Receipt
        </button>
      </div>
    </motion.div>
  );
}

export default function Page() {
  const { trackingToken } = useParams<{ trackingToken: string }>();
  const { data: order, isLoading, error } = useOrderByToken(trackingToken);
  const queryClient = useQueryClient();

  useOrderRealtime(order?.id);

  const updateStatusMutation = useMutation({
    mutationFn: ({ status, reason }: { status: OrderStatus; reason?: string }) => {
      if (!order) throw new Error('No order found');
      return orderService.updateStatus(order.id, status, reason);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', 'token', trackingToken] });
      toast.success(`Order successfully ${variables.status === 'cancelled' ? 'cancelled' : 'marked as completed'}`);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update order');
    },
  });

  const handleCancelOrder = () => {
    if (window.confirm('Are you sure you want to cancel your order?')) {
      updateStatusMutation.mutate({ status: 'cancelled', reason: 'Cancelled by customer' });
    }
  };

  const handleCompleteOrder = () => {
    updateStatusMutation.mutate({ status: 'completed' });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Tracking link copied!');
  };

  return (
    <main className="min-h-screen bg-[#0D0B09]">
      <Navbar />

      <section className="pt-24 pb-6 px-6 md:px-12 no-print">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-serif text-4xl text-[#F7F3EC] mb-2">Order Tracking</h1>
            <p className="text-[#C7BFB2]">Real-time updates on your order</p>
          </motion.div>
        </div>
      </section>

      <section className="px-6 md:px-12 pb-24">
        <div className="max-w-3xl mx-auto">
          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          ) : error || !order ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <XCircle size={40} className="text-red-400 mb-4" />
              <h2 className="font-serif text-xl text-[#F7F3EC] mb-2">Order not found</h2>
              <p className="text-sm text-[#C7BFB2] mb-4">The tracking link may be invalid or expired</p>
              <Link
                href="/menu"
                className="rounded-[4px] bg-[#D4A24C] px-6 py-2 text-sm font-medium text-[#1A1410] hover:bg-[#c8963f]"
              >
                Browse Menu
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Status header */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="no-print rounded-lg border border-[#D4A24C]/15 bg-gradient-to-b from-[#141210] to-[#0D0B09] p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-widest text-[#C7BFB2]">
                    Order #{order.id.slice(0, 8)}
                  </span>
                  <button
                    onClick={copyLink}
                    className="inline-flex items-center gap-1 text-xs text-[#C7BFB2] hover:text-[#D4A24C] transition-colors"
                  >
                    <Copy size={12} />
                    Share Link
                  </button>
                </div>

                {order.status === 'cancelled' ? (
                  <div className="flex items-center gap-3 rounded-lg bg-red-500/10 border border-red-500/20 p-4 mt-4">
                    <XCircle size={24} className="text-red-400 shrink-0" />
                    <div>
                      <p className="font-medium text-red-400">Order Cancelled</p>
                      {order.cancellation_reason && (
                        <p className="text-sm text-[#C7BFB2] mt-0.5">{order.cancellation_reason}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-6">
                    {/* Progress steps */}
                    <div className="flex items-center justify-between">
                      {steps.map((step, i) => {
                        const currentIdx = getStepIndex(order.status);
                        const isDone = i <= currentIdx;
                        const isCurrent = i === currentIdx;
                        const Icon = step.icon;

                        return (
                          <div key={step.status} className="flex flex-1 items-center">
                            <div className="flex flex-col items-center">
                              <motion.div
                                animate={isCurrent ? { scale: [1, 1.15, 1] } : {}}
                                transition={isCurrent ? { repeat: Infinity, duration: 2 } : {}}
                                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${isDone
                                    ? 'border-[#D4A24C] bg-[#D4A24C]/15 text-[#D4A24C]'
                                    : 'border-[#D4A24C]/15 text-[#C7BFB2]/40'
                                  }`}
                              >
                                <Icon size={18} />
                              </motion.div>
                              <span
                                className={`mt-2 text-[10px] uppercase tracking-wider ${isDone ? 'text-[#D4A24C]' : 'text-[#C7BFB2]/40'
                                  }`}
                              >
                                {step.label}
                              </span>
                            </div>
                            {i < steps.length - 1 && (
                              <div
                                className={`h-0.5 flex-1 mx-2 rounded transition-colors ${i < currentIdx ? 'bg-[#D4A24C]' : 'bg-[#D4A24C]/10'
                                  }`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Customer actions */}
                {['pending', 'confirmed'].includes(order.status) && (
                  <div className="mt-6 pt-4 border-t border-[#D4A24C]/10 flex justify-end">
                    <button
                      onClick={handleCancelOrder}
                      disabled={updateStatusMutation.isPending}
                      className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 rounded-md text-xs font-semibold tracking-wider uppercase transition-all disabled:opacity-50"
                    >
                      Cancel Order
                    </button>
                  </div>
                )}

                {order.status === 'ready' && (
                  <div className="mt-6 pt-4 border-t border-[#D4A24C]/10 flex justify-center">
                    <button
                      onClick={handleCompleteOrder}
                      disabled={updateStatusMutation.isPending}
                      className="w-full px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-bold tracking-wider uppercase transition-all shadow-md shadow-emerald-950/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={14} />
                      I Have Received My Order
                    </button>
                  </div>
                )}
              </motion.div>

              {/* Order details / Receipt */}
              {order.status === 'completed' ? (
                <OrderReceipt order={order} />
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="no-print rounded-lg border border-[#D4A24C]/15 bg-gradient-to-b from-[#141210] to-[#0D0B09] p-6"
                >
                  <h2 className="font-serif text-lg text-[#F7F3EC] mb-4">Order Details</h2>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                    <div>
                      <span className="text-[#C7BFB2]/60 text-xs uppercase tracking-wider">Type</span>
                      <p className="text-[#F7F3EC] mt-0.5 capitalize">{order.order_type.replace('_', ' ')}</p>
                    </div>
                    {order.table_number && (
                      <div>
                        <span className="text-[#C7BFB2]/60 text-xs uppercase tracking-wider">Table</span>
                        <p className="text-[#F7F3EC] mt-0.5">{order.table_number}</p>
                      </div>
                    )}
                    {order.guest_name && (
                      <div>
                        <span className="text-[#C7BFB2]/60 text-xs uppercase tracking-wider">Name</span>
                        <p className="text-[#F7F3EC] mt-0.5">{order.guest_name}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-[#C7BFB2]/60 text-xs uppercase tracking-wider">Placed</span>
                      <p className="text-[#F7F3EC] mt-0.5">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {order.items && order.items.length > 0 && (
                    <div className="border-t border-[#D4A24C]/10 pt-4 space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-[#C7BFB2]">
                            {(item.food_item as { name?: string } | undefined)?.name ?? 'Item'}{' '}
                            ({sizeLabels[item.size]}) × {item.quantity}
                          </span>
                          <span className="text-[#F7F3EC]">₹{item.subtotal.toFixed(0)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2 border-t border-[#D4A24C]/10">
                        <span className="text-[#C7BFB2] font-medium">Total</span>
                        <span className="text-xl font-serif text-[#D4A24C]">₹{order.total_amount.toFixed(0)}</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Back to Orders Link */}
              <div className="no-print flex justify-center pt-6">
                <Link
                  href="/my-orders"
                  className="inline-flex items-center gap-2 text-sm text-[#C7BFB2] hover:text-[#D4A24C] transition-colors"
                >
                  <ArrowLeft size={16} />
                  View All My Orders
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>


    </main>
  );
}
// Order tracking page
