-- DASHBOARD KINERJA KESEHATAN DINKESKB KAYONG UTARA - V14
-- Jalankan SELURUH script ini di Supabase > SQL Editor > New query > Run.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'VIEWER' check (role in ('ADMIN','PUSKESMAS','VIEWER')),
  puskesmas_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.puskesmas (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.posyandu (
  id uuid primary key default gen_random_uuid(),
  puskesmas_id uuid not null references public.puskesmas(id) on delete cascade,
  name text not null,
  ilp_status text not null default 'BELUM' check (ilp_status in ('SUDAH','BELUM')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (puskesmas_id, name)
);

create table if not exists public.kader (
  id uuid primary key default gen_random_uuid(),
  posyandu_id uuid not null references public.posyandu(id) on delete cascade,
  name text not null,
  level text not null default 'PURWA' check (level in ('PURWA','MADYA','UTAMA')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_posyandu_puskesmas on public.posyandu(puskesmas_id);
create index if not exists idx_kader_posyandu on public.kader(posyandu_id);
create index if not exists idx_kader_level on public.kader(level);

alter table public.profiles enable row level security;
alter table public.puskesmas enable row level security;
alter table public.posyandu enable row level security;
alter table public.kader enable row level security;

-- Profile: pengguna login dapat melihat profilnya sendiri.
drop policy if exists "profile self select" on public.profiles;
create policy "profile self select" on public.profiles for select to authenticated using (id = auth.uid());

-- Tahap awal: pengguna login dapat membaca/menulis data dashboard.
-- Setelah sistem berjalan, policy dapat diperketat berdasarkan role.
drop policy if exists "auth read puskesmas" on public.puskesmas;
create policy "auth read puskesmas" on public.puskesmas for select to authenticated using (true);
drop policy if exists "auth write puskesmas" on public.puskesmas;
create policy "auth write puskesmas" on public.puskesmas for all to authenticated using (true) with check (true);

drop policy if exists "auth read posyandu" on public.posyandu;
create policy "auth read posyandu" on public.posyandu for select to authenticated using (true);
drop policy if exists "auth write posyandu" on public.posyandu;
create policy "auth write posyandu" on public.posyandu for all to authenticated using (true) with check (true);

drop policy if exists "auth read kader" on public.kader;
create policy "auth read kader" on public.kader for select to authenticated using (true);
drop policy if exists "auth write kader" on public.kader;
create policy "auth write kader" on public.kader for all to authenticated using (true) with check (true);

insert into public.puskesmas (name) values
('PUSKESMAS SIDUK'),
('PUSKESMAS SUKADANA'),
('PUSKESMAS TELUK MELANO'),
('PUSKESMAS MATAN JAYA'),
('PUSKESMAS SUNGAI PADUAN'),
('PUSKESMAS TELUK BATANG'),
('PUSKESMAS TELAGA ARUM'),
('PUSKESMAS TANJUNG SATAI'),
('PUSKESMAS DUSUN BESAR'),
('PUSKESMAS PELAPIS'),
('PUSKESMAS PADANG')
on conflict (name) do nothing;
