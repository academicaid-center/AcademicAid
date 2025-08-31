alter table materials add column if not exists is_approved boolean default true;

-- materials policy: allow read only if approved OR user has admin/teacher role
drop policy if exists materials_read on materials;
create policy materials_read on materials for select using (
  (is_approved and (is_free_preview or can_access_section(auth.uid(), section_id)))
  or is_role(array['admin','teacher'])
);

-- interactive classes: reminder flag and function
alter table interactive_classes add column if not exists reminder_sent boolean default false;

create or replace function send_upcoming_class_reminders()
returns integer as $$
declare v_count int;
begin
  with upcoming as (
    select id from interactive_classes
    where is_active = true and reminder_sent = false
      and scheduled_at is not null
      and scheduled_at <= (now() + interval '30 minutes')
      and scheduled_at > now()
  )
  update interactive_classes ic
  set reminder_sent = true
  where ic.id in (select id from upcoming);

  insert into notifications (user_id, title, body, type)
  select p.id, 'تذكير صف تفاعلي', 'سيبدأ الصف خلال 30 دقيقة', 'class_reminder'
  from profiles p
  where p.notifications_enabled is true;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$ language plpgsql security definer;
