# AcademicAid أكاديميك أيد

منصة تعليمية سورية مبنية بـ Next.js 14 + TypeScript + Tailwind RTL + Supabase مع دعم PWA وإشعارات Push.

## التشغيل المحلي
1) أنشئ ملف `.env.local` (موجود كنموذج) وضع مفاتيح Supabase وFirebase وFCM (اختياري لمخدم الإشعارات).
2) ثبّت الحزم: `bun install` أو `npm i`.
3) شغّل: `bun run dev` أو `npm run dev`.

## Supabase
- نفّذ سكربتات القاعدة بالتسلسل داخل SQL Editor:
  - `supabase/migrations/0001_init.sql`
  - `supabase/migrations/0002_seed_sections.sql`
  - `supabase/migrations/0003_materials_approval_and_reminders.sql`
  - `supabase/migrations/0004_storage.sql`
- فعّل مزوّد Facebook في Authentication مع القيم التي زودتها وتعريف Callback.
- فعّل تسجيل الدخول بالهاتف (OTP) وأعد ضبط الإرسال حسب مزوّد الرسائل لديك.
- أنشئ Bucket باسم `videos` (السياسات ضمن 0004) لرفع الفيديوهات من لوحة الإدارة.
- لجدولة تذكير صفوف تفاعلية قبل 30 دقيقة يمكنك إنشاء Job (pg_cron/Supabase Scheduled) يستدعي `select send_upcoming_class_reminders();` كل 5 دقائق.

## FCM وإشعارات Push
- ضع مفاتيح Firebase في `.env.local`، وأيضاً املأ `public/firebase-config.js` بنفس القيم.
- ملف الخدمة: `public/firebase-messaging-sw.js`.
- إرسال Push اختياري عبر مسار API `/api/push` يحتاج `FIREBASE_SERVER_KEY` في البيئة.

## واجهات أساسية
- تسجيل الدخول: `/(auth)/login` (هاتف OTP + Facebook)
- الأقسام والمواد: `/sections` → تفاصيل القسم مع معاينة مجانية وتوقيع روابط الفيديو من التخزين
- الملف الشخصي: `/profile` مع إعدادات الإشعارات
- الصفوف التفاعلية: `/interactive-classes`
- تفعيل بطاقة: `/cards/activate`
- لوحة الإدارة: `/admin` (الأقسام/المواد/المستخدمون/البطاقات/الإشعارات)

## سياسات الأمان
- RLS مفعّلة لمعظم الجداول.
- تخزين بطاقات الدفع محفوظ كـ SHA256 فقط، مع دالة تفعيل `redeem_prepaid_card`.
- قراءة الفيديوهات عبر روابط موقّتة من Bucket خاص `videos`.

## ملاحظات
- جميع الصفحات تحوي تذييلاً يتضمن: Maher Hendawi • AcademicAid.Center@Gmail.com • (+963) 945745750 • تاريخ اليوم بالعربية.
- التصميم RTL كامل وخفيف، ألوان تعليمية، ودعم PWA للعمل دون اتصال للمحتوى المخزّن مؤقتاً.
