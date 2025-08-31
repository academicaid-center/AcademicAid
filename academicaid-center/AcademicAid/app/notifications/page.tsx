"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Notif = { id: string; title: string; body: string; type: string; is_read: boolean; created_at: string };

export default function NotificationsPage() {
  const [items, setItems] = useState<Notif[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("notifications")
        .select("id, title, body, type, is_read, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setItems((data || []) as any);
    })();
  }, []);

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">الإشعارات</h1>
      <div className="grid gap-3">
        {items.map((n) => (
          <div key={n.id} className="card p-4">
            <div className="text-sm text-gray-500">{new Date(n.created_at).toLocaleString("ar-SY")}</div>
            <div className="font-semibold">{n.title}</div>
            <div className="text-gray-700">{n.body}</div>
          </div>
        ))}
        {items.length === 0 && <div className="text-gray-600">لا توجد إشعارات بعد.</div>}
      </div>
    </div>
  );
}
