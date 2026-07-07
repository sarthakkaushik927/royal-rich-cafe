-- Create an RPC to safely update an order's payment status and the user's loyalty coins
CREATE OR REPLACE FUNCTION verify_payment_and_update_coins(
  p_order_id uuid,
  p_customer_id uuid,
  p_razorpay_payment_id text,
  p_razorpay_signature text,
  p_earned_coins int,
  p_applied_coins int
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_coins int;
BEGIN
  -- Update order payment status
  UPDATE orders 
  SET payment_status = 'paid',
      razorpay_payment_id = p_razorpay_payment_id,
      razorpay_signature = p_razorpay_signature
  WHERE id = p_order_id;

  -- Update loyalty coins if customer_id is provided
  IF p_customer_id IS NOT NULL THEN
    SELECT loyalty_coins INTO v_current_coins FROM profiles WHERE id = p_customer_id;
    IF FOUND THEN
      UPDATE profiles 
      SET loyalty_coins = GREATEST(0, v_current_coins - p_applied_coins) + p_earned_coins
      WHERE id = p_customer_id;
    END IF;
  END IF;

  RETURN true;
END;
$$;
