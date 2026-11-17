export type PushAvailability = "ready" | "not-configured" | "unsupported" | "open-in-new-tab" | "ios-home-screen";

export function pushAvailability(input: {
  configured: boolean;
  embedded: boolean;
  supported: boolean;
  ios: boolean;
  standalone: boolean;
}): PushAvailability {
  if (input.embedded) return "open-in-new-tab";
  if (!input.configured) return "not-configured";
  if (input.ios && !input.standalone) return "ios-home-screen";
  if (!input.supported) return "unsupported";
  return "ready";
}