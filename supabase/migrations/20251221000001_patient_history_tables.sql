
-- Create Patient Cases Table
create table if not exists public.patient_cases (
  id uuid not null default gen_random_uuid(),
  user_id uuid references auth.users not null,
  
  title text default 'Untitled Case',
  status text check (status in ('draft', 'published', 'archived')) default 'draft',
  
  -- We store the highly dynamic nested content as JSONB for performance and flexibility
  -- distinct from relational columns needed for querying (like age/sex could be extracted if needed later)
  patient_info jsonb default '{}'::jsonb, 
  content jsonb default '{}'::jsonb, 

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  primary key (id)
);

-- Enable RLS
alter table public.patient_cases enable row level security;

-- Policies
create policy "Users can view their own cases"
  on public.patient_cases for select
  using (auth.uid() = user_id);

create policy "Users can insert their own cases"
  on public.patient_cases for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own cases"
  on public.patient_cases for update
  using (auth.uid() = user_id);

create policy "Users can delete their own cases"
  on public.patient_cases for delete
  using (auth.uid() = user_id);

-- Autosave often updates 'updated_at'
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
before update on public.patient_cases
for each row
execute procedure public.handle_updated_at();
