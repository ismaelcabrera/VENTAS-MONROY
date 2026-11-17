import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { needsDemoAlert, type StockSnapshot } from "./demo-stock-alert";

// Cambia esto por el nombre único del canal al que te suscribiste en la app ntfy de tu celu
const NTFY_TOPIC = "ventasmonroy2026";

export function useDemoPush(products: StockSnapshot[]) {
  const [session, setSession] = useState<Session | null>(null);
  // Lo dejamos activado por defecto para que en la demo funcione al tiro sin pasos extra
  const [enabled, setEnabled] = useState(true);
  const [devices, setDevices] = useState<{ id: string; label: string; created_at: string }[]>([
    { id: "ntfy-local", label: `Canal ntfy (${NTFY_TOPIC})`, created_at: new Date().toISOString() },
  ]);
  const [message, setMessage] = useState("");
  const [providerErrors, setProviderErrors] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const previous = useRef(products);
  const queue = useRef(Promise.resolve());

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    void supabase.auth.getSession().then(({ data }) => setSession(data.session));
    return () => data.subscription.unsubscribe();
  }, []);

  async function refreshDevices() {
    setDevices([{ id: "ntfy-local", label: `Canal ntfy (${NTFY_TOPIC})`, created_at: new Date().toISOString() }]);
  }

  async function dispatch(before?: StockSnapshot, after?: StockSnapshot) {
    setSending(true);
    setProviderErrors([]);

    const esPrueba = !after;
    const esAgotado = after ? after.stock === 0 : false;

    const titulo = esPrueba
      ? "Prueba de Alerta · Monroy"
      : esAgotado
        ? `AGOTADO: ${after.name}`
        : `Stock bajo: ${after.name}`;

    const cuerpo = esPrueba
      ? "Conexión exitosa con el panel de administración de Servicio de Ventas Monroy."
      : esAgotado
        ? `El producto "${after.name}" se quedó en 0 unidades (antes: ${before?.stock ?? "?"}). ¡Reponer urgente!`
        : `Quedan solo ${after.stock} unidades de "${after.name}" (mínimo configurado: ${after.minStock}).`;

    try {
      const response = await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
        method: "POST",
        headers: {
          Title: titulo,
          Priority: esAgotado ? "urgent" : "default",
          Tags: esPrueba ? "bell" : esAgotado ? "rotating_light" : "warning",
        },
        body: cuerpo,
      });

      if (!response.ok) throw new Error("Error HTTP en ntfy");

      setMessage(
        esPrueba
          ? "Notificación de prueba enviada al celular."
          : `Alerta enviada al celular: ${after.name} (${after.stock} un.)`
      );
    } catch {
      setMessage("No se pudo enviar la alerta al celular. Revisa tu conexión a internet.");
      setProviderErrors(["Error al conectar con el servidor de notificaciones ntfy.sh"]);
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    const old = previous.current;
    previous.current = products;
    if (!enabled) return;

    for (const after of products) {
      const before = old.find((item) => item.id === after.id);
      if (needsDemoAlert(before, after)) {
        queue.current = queue.current.then(() => dispatch(before, after));
      }
    }
  }, [products, enabled]);

  return {
    session,
    enabled,
    setEnabled,
    devices,
    refreshDevices,
    message,
    setMessage,
    providerErrors,
    sending,
    test: () => dispatch(),
  };
}