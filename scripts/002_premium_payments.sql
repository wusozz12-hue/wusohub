-- WusoHub Premium + payment ledger
-- Run this migration in Supabase SQL Editor.

alter table public.profiles
  add column if not exists is_premium boolean not null default false,
  add column if not exists premium_until timestamptz;

create table if not exists public.premium_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount_kurus integer not null,
  currency text not null default 'TRY',
  status text not null default 'pending' check (status in ('pending','paid','failed','refunded')),
  provider text not null default 'iyzico',
  provider_payment_id text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists premium_orders_user_idx on public.premium_orders(user_id, created_at desc);
create index if not exists premium_orders_status_idx on public.premium_orders(status, created_at desc);

alter table public.premium_orders enable row level security;

drop policy if exists "premium_orders_select_own_or_founder" on public.premium_orders;
create policy "premium_orders_select_own_or_founder" on public.premium_orders
  for select using (auth.uid() = user_id or public.is_founder());

drop policy if exists "premium_orders_insert_own" on public.premium_orders;
create policy "premium_orders_insert_own" on public.premium_orders
  for insert with check (auth.uid() = user_id and public.is_active());

drop policy if exists "premium_orders_update_founder" on public.premium_orders;
create policy "premium_orders_update_founder" on public.premium_orders
  for update using (public.is_founder()) with check (public.is_founder());

-- Only the founder/payment webhook should grant Premium.
create or replace function public.protect_premium_columns()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_founder() then
    new.is_premium := old.is_premium;
    new.premium_until := old.premium_until;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_premium_columns_trg on public.profiles;
create trigger protect_premium_columns_trg
  before update on public.profiles
  for each row execute function public.protect_premium_columns();

-- Revenue view for the founder dashboard. Never exposes payment details publicly.
create or replace view public.premium_revenue_summary as
select
  count(*) filter (where status = 'paid')::bigint as paid_orders,
  coalesce(sum(amount_kurus) filter (where status = 'paid'), 0)::bigint as gross_kurus,
  count(*) filter (where status = 'pending')::bigint as pending_orders
from public.premium_orders;
