-- ============================================================
-- Security Fixes (Addressing Supabase Linter Warnings)
-- ============================================================

-- 1. Fix Mutable Search Path and Public Executability for SECURITY DEFINER functions

-- handle_new_user (Trigger function, should not be called via API)
ALTER FUNCTION public.handle_new_user() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

-- update_updated_at (Trigger function, should not be called via API)
ALTER FUNCTION public.update_updated_at() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM authenticated;

-- recompute_order_total (Trigger function, should not be called via API)
ALTER FUNCTION public.recompute_order_total() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.recompute_order_total() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.recompute_order_total() FROM anon;
REVOKE EXECUTE ON FUNCTION public.recompute_order_total() FROM authenticated;

-- get_user_role (Used in RLS, MUST remain executable by anon due to policy evaluation)
ALTER FUNCTION public.get_user_role() SET search_path = public;
-- We do NOT revoke from PUBLIC/anon because RLS policies like "Admins manage food items" 
-- use get_user_role() and apply to anon users during SELECTs. If revoked, anon users get permission denied.
GRANT EXECUTE ON FUNCTION public.get_user_role() TO PUBLIC;


-- 2. Fix Overly Permissive RLS Policies (Always True)

-- orders (INSERT)
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders" 
  ON public.orders FOR INSERT 
  WITH CHECK (
    -- If a customer_id is provided, it MUST match the signed-in user's ID.
    -- Otherwise, it's allowed as a guest order (customer_id is null).
    customer_id = auth.uid() OR customer_id IS NULL
  );

-- orders (UPDATE)
-- Removing the dangerous update policy the linter found (if it exists)
DROP POLICY IF EXISTS "Customers cancel or complete order by tracking token" ON public.orders;


-- order_items (INSERT)
DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;
CREATE POLICY "Anyone can insert order items" 
  ON public.order_items FOR INSERT 
  WITH CHECK (
    -- Only allow inserting items into orders that are currently 'pending' or 'confirmed'.
    -- Our frontend currently creates orders with 'confirmed' status immediately.
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.status IN ('pending', 'confirmed')
    )
  );


-- reservations (INSERT)
DROP POLICY IF EXISTS "Anyone can create reservations" ON public.reservations;
CREATE POLICY "Anyone can create reservations" 
  ON public.reservations FOR INSERT 
  WITH CHECK (
    -- Prevents attackers from inserting reservations with malicious statuses.
    status = 'confirmed' AND payment_status = 'pending'
  );
