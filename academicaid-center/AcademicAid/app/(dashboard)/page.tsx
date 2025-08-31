"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Dashboard() {
  const [name, setName] = useState<string>("");
  const [role, setRole] = useState<string>("student");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single();
      setName(data?.full_name || "");
      setRole(data?.role || "student");
    })();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">مرحباً {name || "بالطالب"}</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/sections" className="card p-5">الأقسام التعليمية</Link>
        <Link href="/cards/activate" className="card p-5">تفعيل بطاقة</Link>
        <Link href="/interactive-classes" className="card p-5">الصفوف التفاعلية</Link>
        {role !== 'student' && <Link href="/admin" className="card p-5">لوحة التحكم</Link>}
      </div>
    </div>
  );
}
