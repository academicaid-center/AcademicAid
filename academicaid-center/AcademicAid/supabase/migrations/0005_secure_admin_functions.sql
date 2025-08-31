-- tighten admin functions with role checks
create or replace function admin_create_prepaid_card(
  p_section_id uuid,
  p_value_amount numeric,
  p_duration_days integer,
  p_plain_code text,
  p_expires_at timestamptz
) returns uuid as $$
declare v_id uuid;
begin
  if not is_role(array['admin']) then
    raise exception 'forbidden';
  end if;
  insert into prepaid_cards (card_code, section_id, value_amount, duration_days, expires_at)
  values (encode(digest(p_plain_code, 'sha256'), 'hex'), p_section_id, p_value_amount, p_duration_days, p_expires_at)
  returning id into v_id;
  return v_id;
end;
$$ language plpgsql security definer;

create or replace function admin_send_notifications(
  p_section_id uuid,
  p_title text,
  p_body text,
  p_type text
) returns integer as $$
declare v_count int;
begin
  if not is_role(array['admin','teacher']) then
    raise exception 'forbidden';
  end if;
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
