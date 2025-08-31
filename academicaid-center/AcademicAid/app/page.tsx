"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single();
        setProfile(data);
      }
    })();
  }, []);

  if (user && profile) {
    // Dashboard for authenticated users
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">مرحباً {profile.full_name || "بالطالب"}</h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/sections" className="card p-5 hover:shadow-md transition-shadow">
            <div className="font-semibold">الأقسام التعليمية</div>
            <div className="text-sm text-gray-600">تصفح جميع المواد</div>
          </Link>
          <Link href="/cards/activate" className="card p-5 hover:shadow-md transition-shadow">
            <div className="font-semibold">تفعيل بطاقة</div>
            <div className="text-sm text-gray-600">ادخل كود البطاقة</div>
          </Link>
          <Link href="/interactive-classes" className="card p-5 hover:shadow-md transition-shadow">
            <div className="font-semibold">الصفوف التفاعلية</div>
            <div className="text-sm text-gray-600">الجلسات المباشرة</div>
          </Link>
          {profile.role !== 'student' && (
            <Link href="/admin" className="card p-5 hover:shadow-md transition-shadow">
              <div className="font-semibold">لوحة التحكم</div>
              <div className="text-sm text-gray-600">إدارة المحتوى</div>
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Landing page for non-authenticated users
  return (
    <div className="space-y-6">
      <section className="card p-6 bg-gradient-to-tr from-primary-50 to-white">
        <h1 className="text-3xl font-bold mb-2">أكاديميك أيد – المنصة التعليمية السورية</h1>
        <p className="text-gray-700">تعلّم بمرونة وبساطة. محتوى مجاني للمعاينة، وبطاقات مسبقة الدفع للوصول الكامل.</p>
        <div className="mt-4 flex gap-3">
          <Link className="btn-primary" href="/sections">ابدأ الآن</Link>
          <Link className="btn-outline" href="/(auth)/login">تسجيل الدخول</Link>
        </div>
      </section>
      <section className="grid md:grid-cols-3 gap-4">
        {[
          { title: "مناسب للجميع", desc: "من الإعدادي حتى الجامعي" },
          { title: "إشعارات فورية", desc: "تذكير الدروس والمحتوى الجديد" },
          { title: "دفع مناسب", desc: "بطاقات مسبقة الدفع تناسب البيئة السورية" },
        ].map((f, i) => (
          <div key={i} className="card p-5">
            <h3 className="font-semibold mb-1">{f.title}</h3>
            <p className="text-gray-600 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
