import { razorpayProvider } from "./razorpay";
import { mockProvider } from "./mock";
import type { PaymentProvider } from "./types";

export function getPaymentProvider(mode: "live" | "mock"): PaymentProvider {
  return mode === "live" ? razorpayProvider : mockProvider;
}
