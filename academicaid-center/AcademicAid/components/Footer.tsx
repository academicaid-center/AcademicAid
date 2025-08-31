"use client";

import React from "react";

export default function Footer() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("ar-SY", { day: "numeric", month: "long", year: "numeric" });
  const dateStr = formatter.format(now);
  return (
    <footer className="container">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <div>
          <span className="font-semibold">المُنشئ:</span> Maher Hendawi • <span className="font-semibold">البريد:</span> AcademicAid.Center@Gmail.com • <span className="font-semibold">الجوال:</span> (+963) 945745750
        </div>
        <div>
          <span className="font-semibold">التاريخ:</span> {dateStr}
        </div>
      </div>
    </footer>
  );
}
