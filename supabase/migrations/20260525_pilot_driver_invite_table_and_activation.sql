-- Applied partially to Supabase project kjapp-pilot (pkglucrwmghtghuynnnp) on 2026-05-25.
-- Internal pilot approach: store pilot invite metadata and allow a verified logged-in user
-- to activate driver role from the mobile app using the temporary pilot code.
-- Tighten this before public launch by moving approval into an admin/fleet portal or RPC.

create extension if not exists pgcrypto;

create table if not exists public.driver_invite_codes (
  id uuid primary key default gen_random_uuid(),
  code_label text not null,
  code_hash text not null unique,
  status text not null default 'active' check (status in ('active','disabled')),
  max_uses integer not null default 10 check (max_uses > 0),
  uses_count integer not null default 0 check (uses_count >= 0),
  expires_at timestamptz,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.driver_invite_codes enable row level security;

drop policy if exists "driver_invite_codes_admin_only" on public.driver_invite_codes;
create policy "driver_invite_codes_admin_only" on public.driver_invite_codes
for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

insert into public.driver_invite_codes (code_label, code_hash, max_uses, expires_at)
values (
  'KJAPP pilot driver code 2026-05-25',
  encode(digest('KJAPP-PILOT-2505', 'sha256'), 'hex'),
  20,
  now() + interval '14 days'
)
on conflict (code_hash) do update
set status = 'active',
    max_uses = greatest(public.driver_invite_codes.max_uses, 20),
    expires_at = greatest(public.driver_invite_codes.expires_at, now() + interval '14 days'),
    updated_at = now();

drop trigger if exists trg_prevent_driver_self_approval on public.drivers;
