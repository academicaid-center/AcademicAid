"use client";

import AdminGate from "@/components/AdminGate";
import Link from "next/link";

export default function TeacherHome() {
  return (
    <AdminGate roles={["teacher", "admin"]}>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">منطقة المعلم</h1>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/admin/materials" className="card p-5">إدارة ورفع المواد (بانتظار موافقة الإدارة)</Link>
          <Link href="/admin/notifications" className="card p-5">إرسال إشعارات للطلاب المشتركين</Link>
        </div>
      </div>
    </AdminGate>
  );
}
