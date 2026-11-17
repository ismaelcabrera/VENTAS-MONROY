import { pushAvailability, type PushAvailability } from "./push-availability";

type RegistrationResult =
  | { status: "registered"; registration: ServiceWorkerRegistration; token: string }
  | { status: Exclude<PushAvailability, "ready"> | "denied" };

const appId = import.meta.env['VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_APP_ID'];
const vapidKey = import.meta.env['VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_VAPID_KEY'];
const config = {
  apiKey: import.meta.env['VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_WEB_API_KEY'],
  projectId: import.meta.env['VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_PROJECT_ID'],
  appId,
  messagingSenderId: appId?.split(":")[1] ?? "",
};

export async function registerPhonePush(): Promise<RegistrationResult> {
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone = window.matchMedia("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  const availability = pushAvailability({
    configured: Boolean(config.apiKey && config.projectId && appId && vapidKey && config.messagingSenderId),
    embedded: window.top !== window.self,
    supported: "Notification" in window && "serviceWorker" in navigator && window.isSecureContext,
    ios,
    standalone,
  });
  if (availability !== "ready") return { status: availability };

  // Request permission directly in the click gesture, before loading the SDK.
  const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
  if (permission !== "granted") return { status: "denied" };
  const { getMessaging, getToken, isSupported, onMessage } = await import("firebase/messaging");
  if (!(await isSupported())) return { status: "unsupported" };
  const { initializeApp, getApps } = await import("firebase/app");
  const registration = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${new URLSearchParams(config).toString()}`);
  const app = getApps().find(candidate => candidate.name === "monroy-notifications") ?? initializeApp(config, "monroy-notifications");
  const messaging = getMessaging(app);
  const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
  foregroundUnsubscribe?.();
  foregroundUnsubscribe = onMessage(messaging, payload => {
    if (!payload.notification) return;
    void registration.showNotification(payload.notification.title ?? "Monroy", {
      body: payload.notification.body ?? "",
      icon: "/icons/monroy-192.png",
      tag: payload.messageId,
    }).catch(() => undefined);
  });
  // The caller saves this only through the separately authenticated own-device endpoint.
  return token ? { status: "registered", registration, token } : { status: "denied" };
}

let foregroundUnsubscribe: (() => void) | undefined;

export async function unregisterPhonePush() {
  const { getApps } = await import("firebase/app");
  const app = getApps().find(candidate => candidate.name === "monroy-notifications");
  if (!app) return;
  const { deleteToken, getMessaging } = await import("firebase/messaging");
  if (!(await deleteToken(getMessaging(app)))) throw new Error("No se pudo desactivar este dispositivo.");
}