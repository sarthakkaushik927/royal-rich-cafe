export interface PaymentCreateRequest {
  amount: number;
  currency: string;
  receipt: string;
}

export interface PaymentCreateResponse {
  id: string;
  amount: number;
  currency: string;
}

export interface PaymentVerifyRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaymentProvider {
  createOrder(request: PaymentCreateRequest): Promise<PaymentCreateResponse>;
  verifyPayment(request: PaymentVerifyRequest): boolean;
}
