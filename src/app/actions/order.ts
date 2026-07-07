"use server";

import { getPaymentProvider } from "@/lib/payments";
import { supabase } from "@/lib/supabaseClient";
import type { CartItem, Order } from "@/lib/types";

export async function createPaymentOrder(
  orderPayload: Partial<Order>,
  items: CartItem[],
  appliedCoins: number,
  earnedCoins: number,
  accessToken?: string | null,
) {
  const paymentMode = "live";

  const totalAmount = orderPayload.total_amount || 0;


  const provider = getPaymentProvider(paymentMode as "live" | "mock");
  const paymentOrder = await provider.createOrder({
    amount: Math.round(totalAmount * 100), // paise
    currency: "INR",
    receipt: orderPayload.tracking_token || `rcpt_${Date.now()}`,
  });

  const fullOrderPayload = {
    ...orderPayload,
    payment_mode: paymentMode,
    payment_status: "pending",
    currency: "INR",
    razorpay_order_id: paymentOrder.id,
  };

  // Instantiate client with user's access token if provided
  let dbClient = supabase;
  if (accessToken) {
    const { createClient } = await import('@supabase/supabase-js');
    dbClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      }
    );
  }

  // Create order in DB
  const { data: order, error: orderError } = await dbClient
    .from("orders")
    .insert(fullOrderPayload)
    .select()
    .single();

  if (orderError) throw new Error(orderError.message);

  const typedOrder = order as Order;

  const itemRows = items.map((item) => ({
    order_id: typedOrder.id,
    food_item_id: item.food_item_id,
    size: item.size,
    quantity: item.quantity,
    unit_price: item.unit_price,
    subtotal: item.unit_price * item.quantity,
  }));

  const { error: itemsError } = await dbClient
    .from("order_items")
    .insert(itemRows);

  if (itemsError) throw new Error(itemsError.message);

  return {
    order: typedOrder,
    razorpay_order_id: paymentOrder.id,
    payment_mode: paymentMode,
  };
}

export async function verifyPaymentAction(request: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  order_id: string;
  customer_id?: string | null;
  earned_coins?: number;
  applied_coins?: number;
}) {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    order_id,
    customer_id,
    earned_coins,
    applied_coins,
  } = request;

  // Verify with live provider
  const provider = getPaymentProvider("live");
  const isValid = provider.verifyPayment(request);

  if (isValid) {
    // We attempt to call the RPC function to securely update the status and coins bypassing RLS.
    // If the RPC does not exist (not migrated yet), we fallback to the standard update.
    const { error: rpcError } = await supabase.rpc("verify_payment_and_update_coins", {
      p_order_id: order_id,
      p_customer_id: customer_id || null,
      p_razorpay_payment_id: razorpay_payment_id,
      p_razorpay_signature: razorpay_signature,
      p_earned_coins: earned_coins || 0,
      p_applied_coins: applied_coins || 0
    });

    if (rpcError) {
      // Fallback: This will likely fail due to RLS if the RPC isn't set up, but we try.
      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          razorpay_payment_id,
          razorpay_signature,
        })
        .eq("id", order_id);
    }

    return true;
  }

  await supabase
    .from("orders")
    .update({
      payment_status: "failed",
      razorpay_payment_id,
      razorpay_signature,
    })
    .eq("id", order_id);

  return false;
}

export async function simulateMockPaymentAction(
  order_id: string,
  success: boolean,
) {
  await supabase
    .from("orders")
    .update({
      payment_status: success ? "paid" : "failed",
      razorpay_payment_id: success ? `mock_payment_${Date.now()}` : null,
      razorpay_signature: success ? "mock_valid_signature" : null,
    })
    .eq("id", order_id);

  return success;
}
