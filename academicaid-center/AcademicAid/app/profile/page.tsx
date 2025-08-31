"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data } = await supabase.from("profiles").select("full_name, phone, notifications_enabled").eq("id", user.id).single();
      setFullName(data?.full_name || "");
      setPhone(data?.phone || "");
      setNotificationsEnabled(!!data?.notifications_enabled);
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ full_name: fullName, phone, notifications_enabled: notificationsEnabled, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    alert("تم حفظ التغييرات");
  };

  if (loading) return <div>جارٍ التحميل...</div>;

  return (
    <div className="max-w-xl mx-auto card p-6 space-y-3">
      <h1 className="text-2xl font-bold">الملف الشخصي</h1>
      <div>
        <label className="label">الاسم الكامل</label>
        <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>
      <div>
        <label className="label">رقم الجوال</label>
        <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div className="flex items-center gap-2">
        <input id="notif" type="checkbox" checked={notificationsEnabled} onChange={(e) => setNotificationsEnabled(e.target.checked)} />
        <label htmlFor="notif">تفعيل إشعارات Push</label>
      </div>
      <button className="btn-primary" onClick={save}>حفظ</button>
    </div>
  );
}
