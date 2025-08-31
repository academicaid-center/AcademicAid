"use client";

import AdminGate from "@/components/AdminGate";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

type Section = { id: string; name_ar: string };

export default function AdminNotifications() {
  const [sections, setSections] = useState<Section[]>([]);
  const [secId, setSecId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("general");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("sections").select("id, name_ar");
      setSections((data || []) as any);
    })();
  }, []);

  const send = async () => {
    const { error } = await supabase.rpc("admin_send_notifications", {
      p_section_id: secId || null,
      p_title: title,
      p_body: body,
      p_type: type,
    });
    if (error) return alert(error.message);

    // Try to also send FCM push if server key configured
    try {
      let tokens: string[] = [];
      if (!secId) {
        const { data } = await supabase
          .from("profiles")
          .select("push_token")
          .not("push_token", "is", null)
          .eq("notifications_enabled", true);
        tokens = (data || []).map((x: any) => x.push_token).filter(Boolean);
      } else {
        const { data } = await supabase
          .from("user_entitlements")
          .select("profiles!inner(push_token)")
          .eq("section_id", secId)
          .is("expires_at", null);
        tokens = (data || []).map((x: any) => x.profiles?.push_token).filter(Boolean);
      }
      if (tokens.length) {
        await fetch('/api/push', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tokens, title, body, data: { type } }) });
      }
    } catch {}

    alert("تم الإرسال");
    setTitle("");
    setBody("");
  };

  return (
    <AdminGate roles={["admin", "teacher"]}>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">إرسال إشعارات Push</h1>
        <div className="card p-4 grid sm:grid-cols-2 gap-3">
          <div>
            <label className="label">إلى قسم</label>
            <select className="input" value={secId} onChange={(e) => setSecId(e.target.value)}>
              <option value="">كل المستخدمين</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>{s.name_ar}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">النوع</label>
            <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="general">عام</option>
              <option value="new_content">محتوى جديد</option>
              <option value="class_reminder">تذكير صف</option>
              <option value="payment_success">نجاح دفع</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">العنوان</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">النص</label>
            <textarea className="input" value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <button className="btn-primary" onClick={send}>إرسال</button>
          </div>
        </div>
      </div>
    </AdminGate>
  );
}
