"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type IClass = { id: string; title: string; description: string | null; scheduled_at: string | null; meeting_url: string | null; is_active: boolean };

export default function InteractiveClasses() {
  const [items, setItems] = useState<IClass[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("interactive_classes")
        .select("id, title, description, scheduled_at, meeting_url, is_active")
        .eq("is_active", true)
        .order("scheduled_at", { ascending: true });
      setItems((data || []) as any);
    })();
  }, []);

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">الصفوف التفاعلية</h1>
      <div className="grid gap-3">
        {items.map((c) => (
          <div key={c.id} className="card p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{c.title}</div>
              {c.scheduled_at && (
                <div className="badge">{new Date(c.scheduled_at).toLocaleString("ar-SY")}</div>
              )}
            </div>
            {c.description && <p className="text-sm text-gray-700 mt-1">{c.description}</p>}
            {c.meeting_url && (
              <Link href={c.meeting_url} target="_blank" className="btn-primary mt-3 inline-block">انضمام</Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
