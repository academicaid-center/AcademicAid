"use client";

import AdminGate from "@/components/AdminGate";
import Link from "next/link";

export default function AdminHome() {
  return (
    <AdminGate roles={["admin", "teacher"]}>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { href: "/admin/sections", title: "إدارة الأقسام" },
            { href: "/admin/materials", title: "إدارة المواد" },
            { href: "/admin/users", title: "إدارة المستخدمين" },
            { href: "/admin/cards", title: "بطاقات الدفع المسبق" },
            { href: "/admin/notifications", title: "إرسال إشعارات" },
          ].map((x) => (
            <Link key={x.href} href={x.href} className="card p-5 hover:shadow-md">
              <div className="font-semibold">{x.title}</div>
            </Link>
          ))}
        </div>
      </div>
    </AdminGate>
  );
}
