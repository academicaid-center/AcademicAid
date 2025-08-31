import Link from "next/link";

export default function Home() {
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
