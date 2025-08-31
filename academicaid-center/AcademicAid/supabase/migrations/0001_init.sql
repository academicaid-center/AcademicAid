-- Enable extensions
create extension if not exists pgcrypto;

-- Tables
create table if not exists profiles (
  id uuid references auth.users(id) primary key,
  phone text unique not null,
  full_name text not null default '',
  role text check (role in ('admin','teacher','student')) default 'student',
  push_token text,
  notifications_enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists sections (
  id uuid default gen_random_uuid() primary key,
  name_ar text not null,
  name_en text not null,
  description text,
  color_theme text default '#3B82F6',
  icon text,
  created_at timestamptz default now()
);

create table if not exists materials (
  id uuid default gen_random_uuid() primary key,
  section_id uuid references sections(id) on delete cascade,
  title text not null,
  description text,
  video_url text,
  is_free_preview boolean default false,
  order_index integer default 0,
  duration_minutes integer,
  created_at timestamptz default now()
);

create table if not exists user_entitlements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  section_id uuid references sections(id) on delete cascade,
  access_type text check (access_type in ('free','premium')),
  expires_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists prepaid_cards (
  id uuid default gen_random_uuid() primary key,
  card_code text unique not null, -- sha256 hash of code
  section_id uuid references sections(id),
  value_amount numeric(10,2) not null,
  duration_days integer default 30,
  is_used boolean default false,
  used_by uuid references profiles(id),
  used_at timestamptz,
  created_at timestamptz default now(),
  expires_at timestamptz
);

create table if not exists payments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  section_id uuid references sections(id) on delete set null,
  amount numeric(10,2),
  status text check (status in ('pending','completed','failed')),
  payment_method text check (payment_method in ('prepaid_card','bank_transfer','cash')),
  reference text,
  prepaid_card_id uuid references prepaid_cards(id),
  created_at timestamptz default now()
);

create table if not exists interactive_classes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  scheduled_at timestamptz,
  meeting_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  body text not null,
  type text check (type in ('class_reminder','new_content','payment_success','general')),
  data jsonb,
  is_read boolean default false,
  sent_at timestamptz default now(),
  created_at timestamptz default now()
);

-- updated_at trigger
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row
  execute procedure set_updated_at();

-- Profile creation on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, phone, full_name)
  values (new.id, coalesce(new.phone, ''), coalesce(new.raw_user_meta_data->>'full_name',''))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Access helper
create or replace function can_access_section(p_user_id uuid, p_section_id uuid)
returns boolean as $$
  select exists (
    select 1 from user_entitlements ue
    where ue.user_id = p_user_id and ue.section_id = p_section_id and (ue.expires_at is null or ue.expires_at > now())
  );
$$ language sql stable;

-- Prepaid card admin create (stores sha256 hash)
create or replace function admin_create_prepaid_card(
  p_section_id uuid,
  p_value_amount numeric,
  p_duration_days integer,
  p_plain_code text,
  p_expires_at timestamptz
) returns uuid as $$
declare v_id uuid;
begin
  insert into prepaid_cards (card_code, section_id, value_amount, duration_days, expires_at)
  values (encode(digest(p_plain_code, 'sha256'), 'hex'), p_section_id, p_value_amount, p_duration_days, p_expires_at)
  returning id into v_id;
  return v_id;
end;
$$ language plpgsql security definer;

-- Redeem card
create or replace function redeem_prepaid_card(p_plain_code text)
returns json as $$
declare v_card prepaid_cards%rowtype; v_user uuid; v_exp timestamptz; v_entitlement uuid;
begin
  v_user := auth.uid();
  if v_user is null then raise exception 'not_authenticated'; end if;
  select * into v_card from prepaid_cards where card_code = encode(digest(p_plain_code, 'sha256'), 'hex') limit 1;
  if not found then raise exception 'invalid_card_code'; end if;
  if v_card.is_used then raise exception 'card_already_used'; end if;
  if v_card.expires_at is not null and v_card.expires_at < now() then raise exception 'card_expired'; end if;

  v_exp := (now() + make_interval(days => coalesce(v_card.duration_days, 30)));

  update prepaid_cards set is_used = true, used_by = v_user, used_at = now() where id = v_card.id;

  insert into user_entitlements (user_id, section_id, access_type, expires_at)
  values (v_user, v_card.section_id, 'premium', v_exp)
  returning id into v_entitlement;

  insert into payments (user_id, section_id, amount, status, payment_method, reference, prepaid_card_id)
  values (v_user, v_card.section_id, v_card.value_amount, 'completed', 'prepaid_card', 'redeem', v_card.id);

  insert into notifications (user_id, title, body, type)
  values (v_user, 'تم تفعيل البطاقة', 'تم تفعيل الوصول للمحتوى بنجاح', 'payment_success');

  return json_build_object('entitlement_id', v_entitlement, 'expires_at', v_exp);
end;
$$ language plpgsql security definer;

-- Bulk notifications
create or replace function admin_send_notifications(
  p_section_id uuid,
  p_title text,
  p_body text,
  p_type text
) returns integer as $$
declare v_count int;
begin
  if p_section_id is null then
    insert into notifications (user_id, title, body, type)
    select p.id, p_title, p_body, p_type from profiles p where p.notifications_enabled is true;
    get diagnostics v_count = row_count;
  else
    insert into notifications (user_id, title, body, type)
    select distinct ue.user_id, p_title, p_body, p_type
    from user_entitlements ue
    where ue.section_id = p_section_id and (ue.expires_at is null or ue.expires_at > now());
    get diagnostics v_count = row_count;
  end if;
  return v_count;
end;
$$ language plpgsql security definer;

-- RLS
alter table profiles enable row level security;
alter table sections enable row level security;
alter table materials enable row level security;
alter table user_entitlements enable row level security;
alter table prepaid_cards enable row level security;
alter table payments enable row level security;
alter table interactive_classes enable row level security;
alter table notifications enable row level security;

-- helper: is admin or teacher
create or replace function is_role(p_roles text[])
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = any(p_roles)
  );
$$ language sql stable;

-- profiles
create policy if not exists profiles_select_self on profiles for select using (id = auth.uid() or is_role(array['admin']));
create policy if not exists profiles_update_self on profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- sections
create policy if not exists sections_read on sections for select using (true);
create policy if not exists sections_write on sections for all using (is_role(array['admin','teacher'])) with check (is_role(array['admin','teacher']));

-- materials
create policy if not exists materials_read on materials for select using (
  is_free_preview
  or can_access_section(auth.uid(), section_id)
);
create policy if not exists materials_write on materials for all using (is_role(array['admin','teacher'])) with check (is_role(array['admin','teacher']));

-- user_entitlements
create policy if not exists ue_read on user_entitlements for select using (user_id = auth.uid() or is_role(array['admin']));
create policy if not exists ue_write_admin on user_entitlements for all using (is_role(array['admin'])) with check (is_role(array['admin']));

-- prepaid_cards (only admin can select/insert/update; hash stored so safe)
create policy if not exists cards_read_admin on prepaid_cards for select using (is_role(array['admin']));
create policy if not exists cards_write_admin on prepaid_cards for all using (is_role(array['admin'])) with check (is_role(array['admin']));

-- payments
create policy if not exists pay_read_self on payments for select using (user_id = auth.uid() or is_role(array['admin']));
create policy if not exists pay_write_admin on payments for all using (is_role(array['admin'])) with check (is_role(array['admin']));

-- interactive_classes: public read; admin/teacher write
create policy if not exists ic_read on interactive_classes for select using (true);
create policy if not exists ic_write on interactive_classes for all using (is_role(array['admin','teacher'])) with check (is_role(array['admin','teacher']));

-- notifications: owner read; admin/teacher insert
create policy if not exists notif_read_self on notifications for select using (user_id = auth.uid());
create policy if not exists notif_insert_admin on notifications for insert with check (is_role(array['admin','teacher']));

-- Grant execute on functions to anon/authenticated
grant execute on function admin_create_prepaid_card(uuid, numeric, integer, text, timestamptz) to authenticated;
grant execute on function redeem_prepaid_card(text) to authenticated;
grant execute on function admin_send_notifications(uuid, text, text, text) to authenticated;
