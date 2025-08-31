"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Section = { id: string; name_ar: string; name_en: string; description: string | null; color_theme: string | null; icon: string | null };

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("sections").select("id, name_ar, name_en, description, color_theme, icon").order("name_ar");
      setSections(data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div>جارٍ التحميل...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">الأقسام التعليمية</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((s) => (
          <Link key={s.id} href={`/sections/${s.id}`} className="card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{s.name_ar}</h3>
                <p className="text-xs text-gray-500">{s.name_en}</p>
              </div>
              <span className="badge" style={{ backgroundColor: s.color_theme || undefined }}>قسم</span>
            </div>
            {s.description && <p className="mt-2 text-sm text-gray-600 line-clamp-2">{s.description}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
