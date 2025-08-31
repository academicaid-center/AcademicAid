"use client";

import AdminGate from "@/components/AdminGate";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

type Profile = { id: string; full_name: string | null; phone: string; role: "admin"|"teacher"|"student" };

export default function AdminUsers() {
  const [items, setItems] = useState<Profile[]>([]);

  const load = async () => {
    const { data } = await supabase.from("profiles").select("id, full_name, phone, role").order("created_at", { ascending: false });
    setItems((data || []) as any);
  };

  useEffect(() => {
    load();
  }, []);

  const updateRole = async (id: string, role: Profile["role"]) => {
    await supabase.from("profiles").update({ role, updated_at: new Date().toISOString() }).eq("id", id);
    await load();
  };

  return (
    <AdminGate roles={["admin"]}>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
        <div className="grid gap-3">
          {items.map((u) => (
            <div key={u.id} className="card p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold">{u.full_name || "—"}</div>
                <div className="text-xs text-gray-500">{u.phone}</div>
              </div>
              <div className="flex items-center gap-2">
                {(["student","teacher","admin"] as const).map(r => (
                  <button key={r} className={`btn px-3 py-1 border ${u.role===r? 'bg-primary-600 text-white':'bg-white'}`} onClick={() => updateRole(u.id, r)}>{r}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminGate>
  );
}
