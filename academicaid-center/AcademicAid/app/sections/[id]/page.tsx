"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Material = { id: string; title: string; description: string | null; video_url: string | null; is_free_preview: boolean; order_index: number; duration_minutes: number | null };

type Section = { id: string; name_ar: string };

export default function SectionDetail() {
  const params = useParams<{ id: string }>();
  const [section, setSection] = useState<Section | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [signed, setSigned] = useState<Record<string, string>>({});
  const [canAccess, setCanAccess] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const sectionId = params.id as string;
      const [{ data: s }, { data: m }] = await Promise.all([
        supabase.from("sections").select("id, name_ar").eq("id", sectionId).single(),
        supabase
          .from("materials")
          .select("id, title, description, video_url, is_free_preview, order_index, duration_minutes, section_id")
          .eq("section_id", sectionId)
          .order("order_index"),
      ]);
      setSection(s as any);
      const mats = (m || []) as any as Material[];
      setMaterials(mats);

      const needSign = mats.filter((x) => x.video_url && !/^https?:\/\//.test(x.video_url));
      const entries = await Promise.all(
        needSign.map(async (x) => {
          const r = await supabase.storage.from("videos").createSignedUrl(x.video_url as string, 3600);
          return [x.id, r.data?.signedUrl || ""] as const;
        })
      );
      setSigned(Object.fromEntries(entries));

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: entitlement } = await supabase
        .from("user_entitlements")
        .select("id")
        .eq("user_id", user.id)
        .eq("section_id", sectionId)
        .is("expires_at", null)
        .limit(1)
        .maybeSingle();
      setCanAccess(!!entitlement);
    })();
  }, [params.id]);

  if (!section) return <div>جارٍ التحميل...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{section.name_ar}</h1>
      <div className="grid gap-3">
        {materials.map((m) => (
          <div key={m.id} className="card p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{m.title}</div>
              {!m.is_free_preview && !canAccess && <span className="badge bg-yellow-100 text-yellow-700">محتوى مدفوع</span>}
            </div>
            {m.description && <p className="text-sm text-gray-600 mt-1">{m.description}</p>}
            {(m.is_free_preview || canAccess) && m.video_url && (
              <div className="mt-3">
                <iframe className="w-full aspect-video rounded-lg border" src={signed[m.id] || m.video_url} allowFullScreen />
              </div>
            )}
            {!m.is_free_preview && !canAccess && (
              <div className="mt-3 text-sm text-gray-700">قم بتفعيل بطاقة القسم للوصول إلى جميع المواد.</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
