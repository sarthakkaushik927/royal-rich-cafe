import Razorpay from "razorpay";
import crypto from "crypto";
import type {
  PaymentProvider,
  PaymentCreateRequest,
  PaymentCreateResponse,
  PaymentVerifyRequest,
} from "./types";

export const razorpayProvider: PaymentProvider = {
  async createOrder(
    request: PaymentCreateRequest,
  ): Promise<PaymentCreateResponse> {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "",
    });

    const options = {
      amount: request.amount,
      currency: request.currency,
      receipt: request.receipt,
    };

    const order = await razorpay.orders.create(options);

    return {
      id: order.id,
      amount: Number(order.amount),
      currency: order.currency,
    };
  },

  verifyPayment(request: PaymentVerifyRequest): boolean {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      request;
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(body.toString())
      .digest("hex");

    return expectedSignature === razorpay_signature;
  },
};
