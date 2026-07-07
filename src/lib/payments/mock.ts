import type {
  PaymentProvider,
  PaymentCreateRequest,
  PaymentCreateResponse,
  PaymentVerifyRequest,
} from "./types";

export const mockProvider: PaymentProvider = {
  async createOrder(
    request: PaymentCreateRequest,
  ): Promise<PaymentCreateResponse> {
    return {
      id: `mock_order_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      amount: request.amount,
      currency: request.currency,
    };
  },

  verifyPayment(request: PaymentVerifyRequest): boolean {
    return request.razorpay_signature === "mock_valid_signature";
  },
};
