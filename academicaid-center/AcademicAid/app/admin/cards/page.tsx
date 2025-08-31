"use client";

import AdminGate from "@/components/AdminGate";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

function generateCode() {
  let s = "";
  for (let i = 0; i < 12; i++) s += Math.floor(Math.random() * 10).toString();
  return s;
}

type Section = { id: string; name_ar: string };

type Card = { id: string; section_id: string | null; value_amount: string; duration_days: number; is_used: boolean; used_at: string | null };

export default function AdminCards() {
  const [sections, setSections] = useState<Section[]>([]);
  const [secId, setSecId] = useState<string>("");
  const [valueAmount, setValueAmount] = useState<string>("0");
  const [duration, setDuration] = useState<number>(30);
  const [code, setCode] = useState<string>(generateCode());
  const [list, setList] = useState<Card[]>([]);

  const load = async () => {
    const [{ data: secs }, { data: cards }] = await Promise.all([
      supabase.from("sections").select("id, name_ar"),
      supabase.from("prepaid_cards").select("id, section_id, value_amount, duration_days, is_used, used_at").order("created_at", { ascending: false }).limit(50),
    ]);
    setSections((secs || []) as any);
    setList((cards || []) as any);
  };

  useEffect(() => {
    load();
  }, []);

  const createCard = async () => {
    const { data, error } = await supabase.rpc("admin_create_prepaid_card", {
      p_section_id: secId || null,
      p_value_amount: Number(valueAmount),
      p_duration_days: duration,
      p_plain_code: code,
      p_expires_at: null,
    });
    if (error) return alert(error.message);
    alert(`تم إنشاء البطاقة بكود: ${code}\nيرجى حفظ الكود قبل إغلاق هذه الرسالة.`);
    setCode(generateCode());
    await load();
  };

  return (
    <AdminGate roles={["admin"]}>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">بطاقات الدفع المسبق</h1>
        <div className="card p-4 grid sm:grid-cols-2 gap-3">
          <div>
            <label className="label">القسم</label>
            <select className="input" value={secId} onChange={(e) => setSecId(e.target.value)}>
              <option value="">— عام —</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>{s.name_ar}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">قيمة البطاقة (للتقرير)</label>
            <input className="input" value={valueAmount} onChange={(e) => setValueAmount(e.target.value)} />
          </div>
          <div>
            <label className="label">مدة الصلاحية (يوم)</label>
            <select className="input" value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
              {[30,60,90].map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="label">كود البطاقة (12 رقم)</label>
            <input className="input" value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <button className="btn-primary" onClick={createCard}>إنشاء بطاقة</button>
          </div>
        </div>

        <div className="grid gap-3">
          {list.map((c) => (
            <div key={c.id} className="card p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold">{sections.find(s => s.id===c.section_id)?.name_ar || '— عام —'}</div>
                <div className="text-xs text-gray-500">المدة: {c.duration_days} يوم • القيمة: {c.value_amount}</div>
              </div>
              <div className={`badge ${c.is_used? 'bg-gray-200 text-gray-600':'bg-green-100 text-green-700'}`}>{c.is_used? 'مستخدمة':'جديدة'}</div>
            </div>
          ))}
        </div>
      </div>
    </AdminGate>
  );
}
