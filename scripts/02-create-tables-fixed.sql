-- Create users table with profile information
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamp default now(),
  system_of_measurement text default 'metric' check (system_of_measurement in ('metric', 'us', 'uk')),
  height numeric,
  age integer,
  sex text default 'not specified' check (sex in ('male', 'female', 'not specified')),
  onboarding_completed boolean default false
);

-- Create BMI entries table
create table if not exists bmi_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  created_at date not null default current_date,
  height numeric not null,
  weight numeric not null,
  bmi numeric generated always as (
    case 
      when height > 0 then round((weight / power(height/100, 2))::numeric, 2)
      else 0
    end
  ) stored
);

-- Enable RLS
alter table users enable row level security;
alter table bmi_entries enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view own profile" on users;
drop policy if exists "Users can update own profile" on users;
drop policy if exists "Users can insert own profile" on users;
drop policy if exists "Users can manage own entries" on bmi_entries;

-- Create policies for users table
create policy "Users can view own profile" on users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on users
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on users
  for insert with check (auth.uid() = id);

-- Create policies for bmi_entries table
create policy "Users can manage own entries" on bmi_entries
  for all using (auth.uid() = user_id);
