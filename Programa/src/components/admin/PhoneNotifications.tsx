import { useState } from "react";
import { Bell, Check, ExternalLink, Loader2, Smartphone, Trash2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { registerPhonePush } from "@/lib/phone-push";
import { useServerFn } from "@tanstack/react-start";
import { saveDemoDevice, removeDemoDevice } from "@/lib/demo-push.functions";
import { supabase } from "@/integrations/supabase/client";
import type { useDemoPush } from "@/lib/use-demo-push";

const messages = {
  "open-in-new-tab": "Abre la tienda publicada en tu celular; esta vista previa no puede pedir permiso para notificaciones.",
  "ios-home-screen": "En iPhone, abre la tienda en Safari, toca Compartir → Agregar a inicio y entra desde el ícono Monroy (iOS 16.4 o posterior).",
  "not-configured": "Actualiza la conexión de Firebase y selecciona «Include web push» para habilitar el registro.",
  unsupported: "Este navegador no admite notificaciones. Prueba Chrome en Android o la app agregada a inicio en iPhone.",
  denied: "No se concedió el permiso. Permite las notificaciones en los ajustes de este sitio en tu navegador y vuelve a intentar.",
};

export function PhoneNotifications({ alerts }: { alerts: ReturnType<typeof useDemoPush> }) {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [needsPublished, setNeedsPublished] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [label, setLabel] = useState("Mi celular");
  const save = useServerFn(saveDemoDevice);
  const remove = useServerFn(removeDemoDevice);

  async function signIn(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setPassword("");
      setMessage(error ? "Correo o contraseña incorrectos; usa tu cuenta de la tienda, no el ingreso ficticio." : "Cuenta conectada para notificaciones.");
    } catch { setMessage("No se pudo conectar tu cuenta. Intenta nuevamente."); }
    finally { setBusy(false); }
  }

  async function register() {
    setBusy(true); setMessage("");
    try {
      const result = await registerPhonePush();
      if (result.status === "registered") {
        await save({ data: { token: result.token, label } });
        setRegistration(result.registration);
        setNeedsPublished(false);
        await alerts.refreshDevices();
        setMessage("Celular guardado en tu cuenta. Usa esta misma cuenta en la computadora y activa las alertas automáticas.");
      } else {
        setMessage(messages[result.status]);
        setNeedsPublished(result.status === "open-in-new-tab");
      }
    } catch {
      setMessage("No se pudo registrar este dispositivo. Revisa tu conexión a internet y vuelve a intentar; si continúa, revisaremos Firebase.");
    } finally { setBusy(false); }
  }

  async function testNotice() {
    if (!registration) return;
    setBusy(true);
    try {
      await registration.showNotification("Monroy · Notificación de prueba", {
        body: "¡Tu celular ya puede mostrar avisos! Esta prueba no corresponde a stock real.",
        icon: "/icons/monroy-192.png",
        tag: "monroy-phone-test",
      });
      setMessage("Aviso de prueba mostrado en este dispositivo. Revisa las notificaciones de tu celular; no es un envío remoto.");
    } catch { setMessage("No se pudo mostrar el aviso. Revisa el permiso de notificaciones en tu navegador."); }
    finally { setBusy(false); }
  }

  async function disable(id: string) {
    setBusy(true);
    try {
      await remove({ data: { id } });
      await alerts.refreshDevices();
      setMessage("Dispositivo eliminado de los avisos de esta cuenta.");
    } catch { setMessage("No se pudo desactivar el registro. Vuelve a intentar."); }
    finally { setBusy(false); }
  }

  return <section className="max-w-2xl space-y-6" aria-label="Notificaciones del celular">
    <ol className="space-y-2 border-b border-admin-line pb-5 text-sm leading-relaxed text-admin-muted">
      <li><strong className="text-admin-ink">1. En tu celular:</strong> abre la tienda publicada y conecta tu cuenta de la tienda aquí.</li>
      <li><strong className="text-admin-ink">2. Registra el celular:</strong> pulsa «Registrar este celular» y acepta el permiso.</li>
      <li><strong className="text-admin-ink">3. En la computadora:</strong> conecta la misma cuenta, activa las alertas y baja el stock ficticio hasta su mínimo.</li>
      <li>iPhone: Safari → Compartir → Agregar a inicio; abre Monroy desde ese ícono (iOS 16.4 o posterior).</li>
    </ol>
    {!alerts.session ? <form onSubmit={signIn} className="space-y-4">
      <h2 className="text-lg font-semibold">Conectar cuenta para avisos</h2>
      <p className="text-sm text-admin-muted">Usa tu cuenta real de la tienda en ambos dispositivos. El ingreso de presentación no conecta las notificaciones.</p>
      <label className="block text-sm">Correo<input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-2 h-10 w-full rounded-md border border-admin-line bg-admin-surface px-3" /></label>
      <label className="block text-sm">Contraseña de la cuenta<input type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className="mt-2 h-10 w-full rounded-md border border-admin-line bg-admin-surface px-3" /></label>
      <Button disabled={busy} type="submit"><LogIn />Conectar cuenta</Button>
      <p className="text-sm text-admin-muted">Si todavía no tienes cuenta, créala desde «Ingresar → Cliente» en la tienda.</p>
    </form> : <div className="flex flex-wrap items-center justify-between gap-3 border-b border-admin-line pb-4"><p className="break-all text-sm">Cuenta para avisos: {alerts.session.user.email}</p><Button variant="ghost" onClick={async () => { await supabase.auth.signOut(); setRegistration(null); }}>Desconectar cuenta</Button></div>}
    {alerts.session && <>
    <div className="flex items-start gap-4 border-b border-admin-line pb-6">
      <span className="grid size-12 shrink-0 place-items-center rounded-md bg-admin-info-soft text-admin-info"><Smartphone className="size-6" /></span>
      <div><h2 className="text-xl font-semibold">Tu celular</h2><p className="mt-2 text-sm text-admin-muted">{registration ? "Registrado en este navegador" : "Sin registrar en esta sesión"}</p></div>
    </div>
    <label className="block text-sm">Nombre del dispositivo<input value={label} maxLength={60} onChange={e => setLabel(e.target.value)} className="mt-2 h-10 w-full rounded-md border border-admin-line bg-admin-surface px-3" /></label>
    <div className="flex flex-wrap gap-3">
      <Button disabled={busy || !label.trim()} onClick={register}>{busy ? <Loader2 className="animate-spin" /> : registration ? <Check /> : <Bell />}{registration ? "Renovar registro" : "Registrar este celular"}</Button>
      {registration && <Button variant="outline" disabled={busy} onClick={testNotice}><Bell />Probar aviso local</Button>}
    </div>
    <div className="space-y-3 border-y border-admin-line py-5"><h2 className="font-semibold">Dispositivos de esta cuenta</h2>{alerts.devices.length ? alerts.devices.map(device => <div key={device.id} className="flex items-center justify-between gap-3 text-sm"><span>{device.label}</span><Button size="icon" variant="ghost" disabled={busy} title="Quitar dispositivo" aria-label={`Quitar ${device.label}`} onClick={() => disable(device.id)}><Trash2 /></Button></div>) : <p className="text-sm text-admin-muted">Todavía no hay celulares registrados.</p>}</div>
    <div className="flex items-center justify-between gap-4"><label htmlFor="auto-demo-alerts" className="text-sm font-medium">Alertas automáticas del inventario ficticio</label><Switch id="auto-demo-alerts" checked={alerts.enabled} disabled={!alerts.devices.length} onCheckedChange={alerts.setEnabled} /></div>
    <p className="text-sm text-admin-muted">Avísame al bajar hasta el stock mínimo o llegar a cero. Una nueva alerta de stock bajo requiere reponer primero; no se avisa por los datos iniciales.</p>
    <Button variant="outline" disabled={alerts.sending || !alerts.devices.length} onClick={alerts.test}><Bell />Enviar prueba al celular</Button>
    </>}
    {message && <p role="status" className="border-l-2 border-primary pl-4 text-sm leading-relaxed">{message}</p>}
    {alerts.message && <p role="status" className="border-l-2 border-admin-info pl-4 text-sm leading-relaxed">{alerts.message}</p>}
    {!!alerts.providerErrors.length && <details className="text-sm text-destructive"><summary>Detalle del envío</summary><pre className="mt-2 whitespace-pre-wrap break-all">{alerts.providerErrors.join("\n")}</pre></details>}
    {needsPublished && <Button asChild variant="outline"><a href="https://servicio-ventas-monroy.lovable.app/admin" target="_blank" rel="noopener noreferrer"><ExternalLink />Abrir tienda publicada</a></Button>}
    <div className="border-t border-admin-line pt-5 text-sm leading-relaxed text-admin-muted">
      <p>El registro corresponde al dispositivo donde pulses el botón; ábrelo desde tu celular.</p>
      <p className="mt-3">El inventario sigue siendo ficticio y se reinicia al salir. Los avisos llegan solamente a los dispositivos de tu cuenta; ningún pedido ni inventario real se modifica.</p>
    </div>
  </section>;
}