-- Applied to Supabase project kjapp-pilot (pkglucrwmghtghuynnnp) on 2026-05-25.
-- Purpose: remove unsafe anonymous ride access and add pilot indexes/status protection.

drop policy if exists "KJAPP testpilot anon insert rides" on public.rides;
drop policy if exists "KJAPP testpilot anon read rides" on public.rides;
drop policy if exists "KJAPP testpilot anon update rides" on public.rides;

drop policy if exists "drivers_update_own_location" on public.driver_locations;
create policy "drivers_update_own_location" on public.driver_locations
for update to authenticated
using (
  exists (
    select 1 from public.drivers d
    where d.id = driver_locations.driver_id
      and d.profile_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.drivers d
    where d.id = driver_locations.driver_id
      and d.profile_id = auth.uid()
  )
);

create index if not exists idx_rides_requested_open on public.rides (status, requested_at desc) where driver_id is null;
create index if not exists idx_rides_rider_recent on public.rides (rider_id, requested_at desc);
create index if not exists idx_rides_driver_recent on public.rides (driver_id, requested_at desc);
create index if not exists idx_drivers_profile_id on public.drivers (profile_id);
create index if not exists idx_driver_locations_driver_recent on public.driver_locations (driver_id, created_at desc);

create or replace function private.prevent_driver_self_approval()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if private.is_admin() then
    return new;
  end if;

  if old.profile_id = auth.uid() then
    if old.status = 'pending' and new.status <> 'pending' then
      raise exception 'Driver approval requires admin or fleet owner';
    end if;

    if old.status = 'suspended' and new.status <> 'suspended' then
      raise exception 'Suspended driver status requires admin or fleet owner';
    end if;

    if old.status in ('approved','offline','online','busy') and new.status not in ('approved','offline','online','busy') then
      raise exception 'Invalid driver self status change';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_prevent_driver_self_approval on public.drivers;
create trigger trg_prevent_driver_self_approval
before update on public.drivers
for each row
execute function private.prevent_driver_self_approval();
