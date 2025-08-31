"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
      setStep("code");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.verifyOtp({ phone, token: code, type: "sms" });
      if (error) throw error;
      if (data?.session) router.push("/sections");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const loginWithFacebook = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: "facebook" });
      if (error) throw error;
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto card p-6">
      <h1 className="text-2xl font-bold mb-4">تسجيل الدخول</h1>
      {step === "phone" && (
        <div className="space-y-3">
          <label className="label">رقم الجوال السوري (مثال: +9639xxxxxxxx)</label>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+9639xxxxxxxx" />
          <button className="btn-primary w-full" onClick={sendOtp} disabled={loading || !phone}>
            {loading ? "جارٍ الإرسال..." : "إرسال الرمز"}
          </button>
          <div className="text-center text-sm text-gray-600">أو</div>
          <button className="btn-outline w-full" onClick={loginWithFacebook} disabled={loading}>
            الدخول عبر Facebook
          </button>
          {error && <div className="text-danger text-sm">{error}</div>}
        </div>
      )}

      {step === "code" && (
        <div className="space-y-3">
          <div className="text-sm text-gray-700">تم إرسال رمز التحقق إلى: {phone}</div>
          <label className="label">رمز التحقق</label>
          <input className="input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="000000" />
          <button className="btn-primary w-full" onClick={verify} disabled={loading || code.length < 4}>
            {loading ? "جارٍ التحقق..." : "تأكيد الدخول"}
          </button>
          {error && <div className="text-danger text-sm">{error}</div>}
        </div>
      )}
    </div>
  );
}
