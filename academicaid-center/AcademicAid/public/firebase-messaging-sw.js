importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

const firebaseConfig = {
  apiKey: self.env?.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: self.env?.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: self.env?.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: self.env?.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: self.env?.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: self.env?.NEXT_PUBLIC_FIREBASE_APP_ID,
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage(function(payload) {
    const title = (payload.notification && payload.notification.title) || 'AcademicAid';
    const body = (payload.notification && payload.notification.body) || '';
    self.registration.showNotification(title, { body });
  });
} catch (e) {
  // ignore
}
