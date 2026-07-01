-- Migration 002: Auto-sync auth.users → public.users via Supabase trigger
--
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- This guarantees every OAuth and email sign-in is reflected in public.users
-- so the backend can always resolve the user's role.
--
-- Safe to re-run: uses CREATE OR REPLACE + DROP TRIGGER IF EXISTS.

-- ─── Function ────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.sync_auth_user_to_public()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_display_name text;
  v_avatar_url   text;
BEGIN
  -- Prefer OAuth metadata names; fall back to email prefix
  v_display_name := COALESCE(
    NULLIF(trim(NEW.raw_user_meta_data->>'full_name'),  ''),
    NULLIF(trim(NEW.raw_user_meta_data->>'name'),       ''),
    NULLIF(trim(NEW.raw_user_meta_data->>'user_name'),  ''),
    split_part(COALESCE(NEW.email, ''), '@', 1),
    'User'
  );

  -- Google stores picture; other providers use avatar_url
  v_avatar_url := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'avatar_url', ''),
    NULLIF(NEW.raw_user_meta_data->>'picture',    '')
  );

  INSERT INTO public.users (
    id, email, display_name, avatar_url, role, is_active, last_login_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    v_display_name,
    v_avatar_url,
    'customer',
    true,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    -- Always update email in case user changed it in their provider
    email         = EXCLUDED.email,
    -- Only overwrite display_name / avatar if we have a real value coming in
    display_name  = COALESCE(NULLIF(EXCLUDED.display_name, ''), public.users.display_name),
    avatar_url    = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
    last_login_at = NOW()
    -- role is intentionally NOT overwritten here; promote via admin tools only
  ;

  RETURN NEW;
END;
$$;

-- ─── Trigger ─────────────────────────────────────────────────────────────────
-- Fires on new user creation AND on every sign-in (last_sign_in_at changes).
DROP TRIGGER IF EXISTS on_auth_user_sync ON auth.users;
CREATE TRIGGER on_auth_user_sync
  AFTER INSERT OR UPDATE OF last_sign_in_at
  ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.sync_auth_user_to_public();
