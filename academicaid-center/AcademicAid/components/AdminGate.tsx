"use client";

import { ReactNode, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminGate({ children, roles = ["admin"] }: { children: ReactNode; roles?: ("admin"|"teacher")[] }) {
  const [state, setState] = useState<"loading" | "denied" | "ok">("loading");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setState("denied");
      const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (data && roles.includes((data.role as any) || "student")) setState("ok");
      else setState("denied");
    })();
  }, [roles]);

  if (state === "loading") return <div>جارٍ التحقق...</div>;
  if (state === "denied") return <div className="text-danger">ليست لديك صلاحية الوصول.</div>;
  return children as any;
}
