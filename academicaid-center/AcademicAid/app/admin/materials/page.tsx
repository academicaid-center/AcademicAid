"use client";

import AdminGate from "@/components/AdminGate";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

type Section = { id: string; name_ar: string };

type Material = { id: string; section_id: string; title: string; description: string | null; video_url: string | null; is_free_preview: boolean; order_index: number; duration_minutes: number | null; is_approved?: boolean };

export default function AdminMaterials() {
  const [sections, setSections] = useState<Section[]>([]);
  const [items, setItems] = useState<Material[]>([]);
  const [form, setForm] = useState<Partial<Material>>({ is_free_preview: false, order_index: 0 });
  const [file, setFile] = useState<File | null>(null);

  const load = async () => {
    const [{ data: secs }, { data: mats }] = await Promise.all([
      supabase.from("sections").select("id, name_ar"),
      supabase.from("materials").select("id, section_id, title, description, video_url, is_free_preview, order_index, duration_minutes, is_approved").order("created_at", { ascending: false }),
    ]);
    setSections((secs || []) as any);
    setItems((mats || []) as any);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    let videoPath = form.video_url || null;
    if (file && form.section_id) {
      const path = `${form.section_id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("videos").upload(path, file, { upsert: true });
      if (upErr) {
        alert(upErr.message);
        return;
      }
      videoPath = path;
    }
    await supabase.from("materials").insert({
      section_id: form.section_id,
      title: form.title,
      description: form.description,
      video_url: videoPath,
      is_free_preview: !!form.is_free_preview,
      order_index: form.order_index || 0,
      duration_minutes: form.duration_minutes || null,
    } as any);
    setForm({ is_free_preview: false, order_index: 0 });
    setFile(null);
    await load();
  };

  const remove = async (id: string) => {
    await supabase.from("materials").delete().eq("id", id);
    await load();
  };

  const toggleApprove = async (id: string, next: boolean) => {
    await supabase.from("materials").update({ is_approved: next }).eq("id", id);
    await load();
  };

  return (
    <AdminGate roles={["admin", "teacher"]}>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">إدارة المواد التعليمية</h1>
        <div className="card p-4 grid sm:grid-cols-2 gap-3">
          <div>
            <label className="label">القسم</label>
            <select className="input" value={form.section_id || ""} onChange={(e) => setForm({ ...form, section_id: e.target.value })}>
              <option value="">اختر قسماً</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>{s.name_ar}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">العنوان</label>
            <input className="input" value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">الوصف</label>
            <textarea className="input" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">ترتيب العرض</label>
            <input type="number" className="input" value={form.order_index || 0} onChange={(e) => setForm({ ...form, order_index: Number(e.target.value) })} />
          </div>
          <div>
            <label className="label">المدة بالدقائق</label>
            <input type="number" className="input" value={form.duration_minutes || 0} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">رفع فيديو (اختياري)</label>
            <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <div className="text-xs text-gray-500 mt-1">سيتم حفظ المسار بشكل آمن وإنشاء روابط موقّتة للعرض.</div>
          </div>
          <div className="flex items-center gap-2">
            <input id="free" type="checkbox" checked={!!form.is_free_preview} onChange={(e) => setForm({ ...form, is_free_preview: e.target.checked })} />
            <label htmlFor="free">معاينة مجانية</label>
          </div>
          <div className="sm:col-span-2">
            <button className="btn-primary" onClick={save}>حفظ المادة</button>
          </div>
        </div>

        <div className="grid gap-3">
          {items.map((m) => (
            <div key={m.id} className="card p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold">{m.title}</div>
                <div className="text-xs text-gray-500">قسم: {sections.find((s) => s.id === m.section_id)?.name_ar || ""}</div>
                <div className="text-xs mt-1">
                  الحالة: {m.is_approved ? <span className="text-green-600">مقبولة</span> : <span className="text-yellow-700">بانتظار الموافقة</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleApprove(m.id, !m.is_approved)} className="btn-outline">{m.is_approved ? 'إلغاء القبول' : 'قبول'}</button>
                <button onClick={() => remove(m.id)} className="btn-outline">حذف</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminGate>
  );
}
