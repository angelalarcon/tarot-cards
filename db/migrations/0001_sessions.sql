-- =============================================================================
-- Tarot Cards · Session telemetry (Option B — minimised, legitimate interest)
-- Run this in the Supabase SQL Editor (project: kusalhbpsqtrgsfznxlz).
--
-- Legal posture
--   * Lawful basis: legitimate interest (Art. 6.1.f GDPR) for basic analytics.
--   * Data minimisation: no IP, no precise geolocation, no fingerprinting,
--     no persistent client-side identifier.
--   * The IP from the visitor's connection is queried against a public IP API
--     (ipwho.is) only to derive the ISO country code; the IP itself is never
--     stored in this database.
--   * session_id is generated in memory per page load (not persisted in
--     localStorage / sessionStorage / cookies), so it is essentially a page-
--     view identifier and does not allow cross-session tracking.
--   * RLS is INSERT-only for anon → write-only telemetry.
--
-- Idempotent: drops the previous version of the table if it exists.
-- =============================================================================

create extension if not exists "pgcrypto";

drop table if exists public.sessions cascade;

create table public.sessions (
  id              uuid        primary key default gen_random_uuid(),

  -- In-memory session identifier (per page load, not persisted client-side).
  session_id      text        not null,
  share_code      text        null,

  -- Coarse origin (derived from IP, IP itself is discarded).
  country_code    text        null,
  country         text        null,

  -- Coarse device / client (no versions, no screen, no hardware fingerprint).
  device_type     text        null,   -- 'desktop' | 'mobile' | 'tablet'
  browser_name    text        null,   -- 'Chrome' | 'Firefox' | 'Safari' | ...
  os_name         text        null,   -- 'Windows' | 'macOS' | 'Linux' | ...

  -- Locale.
  language        text        null,   -- e.g. 'es-ES'
  timezone        text        null,   -- IANA, e.g. 'Europe/Madrid'

  -- Acquisition context (no full URL or query string with reading codes).
  referrer_host   text        null,   -- only the hostname of document.referrer
  utm             jsonb       null,

  created_at      timestamptz not null default now()
);

create index if not exists sessions_created_at_idx
  on public.sessions (created_at desc);
create index if not exists sessions_country_code_idx
  on public.sessions (country_code);
create index if not exists sessions_share_code_idx
  on public.sessions (share_code) where share_code is not null;

-- Row Level Security ----------------------------------------------------------
alter table public.sessions enable row level security;

drop policy if exists "sessions_anon_insert" on public.sessions;
create policy "sessions_anon_insert"
  on public.sessions
  for insert
  to anon, authenticated
  with check (true);

-- No SELECT / UPDATE / DELETE policies for anon → write-only telemetry.
-- Reads happen via the Supabase dashboard or the service_role key.
