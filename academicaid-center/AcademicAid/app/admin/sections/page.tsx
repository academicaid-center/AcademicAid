"use client";

import AdminGate from "@/components/AdminGate";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

type Section = { id: string; name_ar: string; name_en: string; description: string | null; color_theme: string | null; icon: string | null };

export default function AdminSections() {
  const [items, setItems] = useState<Section[]>([]);
  const [form, setForm] = useState<Partial<Section>>({ name_ar: "", name_en: "", color_theme: "#3B82F6" });

  const load = async () => {
    const { data } = await supabase.from("sections").select("id, name_ar, name_en, description, color_theme, icon").order("created_at", { ascending: false });
    setItems((data || []) as any);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    await supabase.from("sections").insert({
      name_ar: form.name_ar,
      name_en: form.name_en,
      description: form.description,
      color_theme: form.color_theme,
      icon: form.icon,
    } as any);
    setForm({ name_ar: "", name_en: "", color_theme: "#3B82F6" });
    await load();
  };

  const remove = async (id: string) => {
    await supabase.from("sections").delete().eq("id", id);
    await load();
  };

  return (
    <AdminGate roles={["admin"]}>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">إدارة الأقسام</h1>
        <div className="card p-4 grid sm:grid-cols-2 gap-3">
          <div>
            <label className="label">الاسم بالعربية</label>
            <input className="input" value={form.name_ar || ""} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} />
          </div>
          <div>
            <label className="label">الاسم بالإنكليزية</label>
            <input className="input" value={form.name_en || ""} onChange={(e) => setForm({ ...form, name_en: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">الوصف</label>
            <textarea className="input" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">لون القسم</label>
            <input type="color" className="input h-10" value={form.color_theme || "#3B82F6"} onChange={(e) => setForm({ ...form, color_theme: e.target.value })} />
          </div>
          <div>
            <label className="label">أيقونة (رمز نصي)</label>
            <input className="input" value={form.icon || ""} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <button className="btn-primary" onClick={save}>حفظ القسم</button>
          </div>
        </div>

        <div className="grid gap-3">
          {items.map((s) => (
            <div key={s.id} className="card p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold">{s.name_ar}</div>
                <div className="text-xs text-gray-500">{s.name_en}</div>
              </div>
              <button onClick={() => remove(s.id)} className="btn-outline">حذف</button>
            </div>
          ))}
        </div>
      </div>
    </AdminGate>
  );
}
