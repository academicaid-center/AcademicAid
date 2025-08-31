"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ActivateCard() {
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async () => {
    setMsg(null);
    const { data, error } = await supabase.rpc("redeem_prepaid_card", { p_plain_code: code });
    if (error) {
      setMsg(error.message);
    } else {
      setMsg("تم تفعيل البطاقة بنجاح");
    }
  };

  return (
    <div className="max-w-md mx-auto card p-6 space-y-3">
      <h1 className="text-2xl font-bold">تفعيل بطاقة الدفع المسبق</h1>
      <label className="label">أدخل كود البطاقة (12 رقم)</label>
      <input className="input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="مثال: 123456789012" />
      <button className="btn-primary" onClick={submit} disabled={code.length !== 12}>تفعيل</button>
      {msg && <div className="text-sm">{msg}</div>}
    </div>
  );
}
