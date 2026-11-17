import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Eye, EyeOff, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";

// A visual presentation step, not authentication or an authorization boundary.
// Never send these fictional form values to a service or browser storage.
export function PresentationEntry({ onEnter }: { onEnter: () => void }) {
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (!String(form.get("demo-user") ?? "").trim() || !String(form.get("demo-password") ?? "").trim()) {
      setError("Completa ambos campos con datos ficticios.");
      return;
    }
    onEnter();
  };
  return <main className="flex min-h-dvh flex-col bg-admin-background px-5 py-8 text-admin-ink">
    <Button asChild variant="ghost" className="self-start text-admin-muted"><Link to="/"><ArrowLeft />Volver a la tienda</Link></Button>
    <div className="mx-auto my-auto w-full max-w-sm py-12">
      <span className="grid size-14 place-items-center rounded-xl bg-primary font-display text-3xl font-bold text-primary-foreground">M</span>
      <p className="mt-6 text-xs font-semibold text-primary">SERVICIO DE VENTAS MONROY</p>
      <h1 className="mt-3 text-3xl font-medium">Administración</h1>
      <p className="mt-3 text-sm text-admin-muted">Acceso de presentación · Solo datos de ejemplo</p>
      <form onSubmit={submit} className="mt-8 space-y-5" autoComplete="off">
        <label className="block text-sm font-medium">Usuario de ejemplo<div className="mt-2 flex h-12 items-center gap-3 rounded-md border border-admin-line bg-admin-surface px-3"><UserRound className="size-4 shrink-0 text-admin-muted" /><input name="demo-user" required placeholder="presentador" autoComplete="off" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></div></label>
        <label className="block text-sm font-medium">Contraseña de ejemplo<div className="mt-2 flex h-12 items-center rounded-md border border-admin-line bg-admin-surface px-3"><input name="demo-password" type={visible ? "text" : "password"} required placeholder="Usa un valor ficticio" autoComplete="off" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /><Button type="button" variant="ghost" size="icon" aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"} title={visible ? "Ocultar contraseña" : "Mostrar contraseña"} onClick={() => setVisible(v => !v)}>{visible ? <EyeOff /> : <Eye />}</Button></div></label>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="h-12 w-full">Ingresar a la presentación<ArrowRight /></Button>
      </form>
      <p className="mt-6 text-xs leading-relaxed text-admin-muted">Simulación sin autenticación real. Usa cualquier usuario y contraseña ficticios; no ingreses tus claves personales.</p>
    </div>
  </main>;
}