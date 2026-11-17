import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { needsDemoAlert } from "./demo-stock-alert";

const tokenSchema = z.string().min(20).max(4096);
export const saveDemoDevice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ token: tokenSchema, label: z.string().trim().min(1).max(60) }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("demo_push_devices").upsert({ user_id: context.userId, ...data }, { onConflict: "user_id,token" });
    if (error) throw new Error("No se pudo guardar el celular.");
    return { saved: true };
  });

export const listDemoDevices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("demo_push_devices").select("id,label,created_at").eq("user_id", context.userId).order("created_at");
    if (error) throw new Error("No se pudieron leer tus dispositivos.");
    return data ?? [];
  });

export const removeDemoDevice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("demo_push_devices").delete().eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error("No se pudo eliminar el dispositivo.");
    return { removed: true };
  });

const snapshot = z.object({ id: z.string().min(1).max(100), name: z.string().trim().min(1).max(100), stock: z.number().int().nonnegative(), minStock: z.number().int().nonnegative(), active: z.boolean() });
const sendSchema = z.object({ eventId: z.string().uuid(), before: snapshot.optional(), after: snapshot.optional(), test: z.boolean().default(false) });

export const sendDemoPush = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => sendSchema.parse(input))
  .handler(async ({ data, context }) => {
    if (!data.test && (!data.after || data.before?.id !== data.after.id || !needsDemoAlert(data.before, data.after))) {
      return { sent: 0, failed: 0, detail: "Sin cambio que requiera alerta." };
    }
    const apiKey = process.env['LOVABLE_API_KEY'];
    const connectionKey = process.env['FIREBASE_MESSAGING_API_KEY'];
    if (!apiKey || !connectionKey) throw new Error("La conexión de notificaciones no está disponible.");
    // Ownership is derived from verified auth, never demo entry or input IDs.
    const { data: devices, error } = await context.supabase.from("demo_push_devices").select("id,token").eq("user_id", context.userId);
    if (error) throw new Error("No se pudieron leer tus dispositivos.");
    if (!devices?.length) return { sent: 0, failed: 0, detail: "Registra tu celular en esta misma cuenta antes de enviar avisos." };
    const { error: eventError } = await context.supabase.from("demo_push_events").insert({ id: data.eventId, user_id: context.userId });
    if (eventError?.code === "23505") return { sent: 0, failed: 0, detail: "Esta prueba ya fue procesada." };
    if (eventError) throw new Error("No se pudo registrar el aviso de prueba.");
    const title = data.test ? "Monroy · Prueba a distancia" : "Monroy · Stock ficticio bajo";
    const body = data.test ? "¡Llegó el aviso desde tu computadora! Es una prueba, sin cambios reales." : `${data.after?.name}: quedan ${data.after?.stock} unidades (mínimo ${data.after?.minStock}). Inventario ficticio.`;
    let sent = 0; let failed = 0; const failures: string[] = [];
    for (const device of devices) {
      let response: Response | undefined;
      let errorBody = "";
      try {
        for (let attempt = 0; attempt < 3; attempt++) {
          response = await fetch("https://connector-gateway.lovable.dev/firebase_messaging/v1/projects/_/messages:send", {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}`, "X-Connection-Api-Key": connectionKey, "Content-Type": "application/json" },
            body: JSON.stringify({ message: { token: device.token, notification: { title, body }, webpush: { notification: { icon: "/icons/monroy-192.png", tag: data.eventId }, fcm_options: { link: "https://servicio-ventas-monroy.lovable.app/admin" } } } }),
          });
          if (response.ok) break;
          errorBody = await response.text();
          console.error(`Firebase notification failed [${response.status}]: ${errorBody}`);
          if ((response.status !== 429 && response.status < 500) || attempt === 2) break;
          await new Promise(resolve => setTimeout(resolve, 250 * 2 ** attempt));
        }
        if (response?.ok) { sent++; continue; }
        if (response?.status === 404 && errorBody.includes("UNREGISTERED")) {
          await context.supabase.from("demo_push_devices").delete().eq("id", device.id).eq("user_id", context.userId);
        }
        failed++; failures.push(`[${response?.status ?? "network"}] ${errorBody}`);
      } catch {
        failed++; failures.push("No se pudo contactar Firebase. No se reenvió el aviso para evitar duplicados.");
      }
    }
    const detail = sent ? `${sent} aviso(s) aceptado(s) por Firebase; revisa tu celular.${failed ? ` ${failed} envío(s) fallaron.` : ""}` : "No se pudo enviar el aviso. Revisa el detalle de Firebase.";
    await context.supabase.from("demo_push_events").update({ status: failed ? (sent ? "partial" : "failed") : "sent", detail }).eq("id", data.eventId).eq("user_id", context.userId);
    return { sent, failed, detail, errors: failures };
  });