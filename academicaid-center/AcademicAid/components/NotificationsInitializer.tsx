"use client";

import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { supabase } from "@/lib/supabaseClient";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export default function NotificationsInitializer() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    (async () => {
      try {
        if (!firebaseConfig.apiKey) return;
        const supported = await isSupported();
        if (!supported) return;

        const app = initializeApp(firebaseConfig);
        const messaging = getMessaging(app);

        if (Notification.permission === "default") {
          await Notification.requestPermission();
        }
        if (Notification.permission !== "granted") return;

        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        if (!vapidKey) return;
        
        const token = await getToken(messaging, { vapidKey: vapidKey });

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user && token) {
          await supabase
            .from("profiles")
            .update({ push_token: token, notifications_enabled: true, updated_at: new Date().toISOString() })
            .eq("id", user.id);
        }

        onMessage(messaging, (payload) => {
          const { title, body } = (payload.notification || {}) as any;
          if (title || body) new Notification(title || "AcademicAid", { body });
        });

        setReady(true);
      } catch (e) {
        console.error("FCM init error", e);
      }
    })();
  }, []);

  return null;
}
