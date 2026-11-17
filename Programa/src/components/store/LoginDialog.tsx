import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { setPresentationEntered } from "@/lib/admin-presentation";

export function LoginDialog() {
  const { loginOpen, setLoginOpen, signIn, signUp, signInWithGoogle } =
    useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [adminDemo, setAdminDemo] = useState(false);
  const navigate = useNavigate();

  if (!loginOpen) return null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (adminDemo) {
      if (!email.trim() || !password.trim()) return;
      setPresentationEntered(true);
      setEmail("");
      setPassword("");
      setLoginOpen(false);
      await navigate({ to: "/admin" });
      return;
    }
    setBusy(true);
    if (mode === "login") {
      const err = await signIn(email.trim(), password);
      if (err) setError(err);
    } else {
      const res = await signUp(
        name.trim() || email.split("@")[0] || "Vecino",
        email.trim(),
        password,
      );
      if (res.error) setError(res.error);
      else if (res.needsConfirmation)
        setInfo(
          "Te enviamos un correo para confirmar tu cuenta. Revisa tu bandeja y vuelve a iniciar sesión.",
        );
    }
    setBusy(false);
  };

  const google = async () => {
    setError(null);
    setBusy(true);
    const err = await signInWithGoogle();
    if (err) setError(err);
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-4">
      <button
        aria-label="Cerrar"
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={() => setLoginOpen(false)}
      />
      <div className="relative w-full max-w-sm rounded-[1.5rem] bg-card p-6 shadow-2xl ring-1 ring-primary/10">
        <button
          onClick={() => setLoginOpen(false)}
          className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-secondary"
          aria-label="Cerrar"
        >
          <X className="size-4" />
        </button>

        <p className="font-hand text-2xl text-primary">
          {mode === "login" ? "¡Qué bueno verte!" : "¡Bienvenido al barrio!"}
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">
          {adminDemo ? "Administración" : mode === "login" ? "Inicia sesión" : "Crea tu cuenta"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {adminDemo ? "Presentación con datos de ejemplo, sin acceso a datos reales." : mode === "login"
            ? "Entra para ver tus pedidos y finalizar tu compra."
            : "Regístrate gratis y guarda tus pedidos."}
        </p>

        <div className="mt-4 flex gap-2" role="group" aria-label="Tipo de acceso">
          <Button variant={!adminDemo ? "secondary" : "ghost"} aria-pressed={!adminDemo} className="flex-1" onClick={() => { setAdminDemo(false); setEmail(""); setPassword(""); setError(null); setInfo(null); }}>Cliente</Button>
          <Button variant={adminDemo ? "secondary" : "ghost"} aria-pressed={adminDemo} className="flex-1" onClick={() => { setAdminDemo(true); setMode("login"); setEmail(""); setPassword(""); setError(null); setInfo(null); }}>Administrador</Button>
        </div>
        {!adminDemo && <button
          onClick={google}
          disabled={busy}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-background py-3 text-sm font-semibold ring-1 ring-input transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
            <path
              fill="#EA4335"
              d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1a6.2 6.2 0 0 1 0-12.4c1.8 0 3 .77 3.7 1.43l2.7-2.6A9.6 9.6 0 0 0 12 2a10 10 0 1 0 0 20c5.77 0 9.6-4.05 9.6-9.76 0-.66-.07-1.16-.16-1.66H12z"
            />
          </svg>
          Continuar con Google
        </button>}

        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />{adminDemo ? "Usa datos ficticios, no tus claves personales" : "o con tu correo"}
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "register" && (
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 w-full rounded-full bg-background px-4 text-sm outline-none ring-1 ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              placeholder="Tu nombre"
            />
          )}
          <input
            required
            type={adminDemo ? "text" : "email"}
            autoComplete={adminDemo ? "off" : "email"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 w-full rounded-full bg-background px-4 text-sm outline-none ring-1 ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            placeholder={adminDemo ? "Usuario de ejemplo (ej. admin)" : "Correo electrónico"}
          />
          <input
            required
            type="password"
            minLength={adminDemo ? 1 : 6}
            autoComplete={adminDemo ? "off" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 w-full rounded-full bg-background px-4 text-sm outline-none ring-1 ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            placeholder={adminDemo ? "Cualquier contraseña ficticia" : "Contraseña"}
          />
          {error && (
            <p className="rounded-2xl bg-destructive/10 px-4 py-2 text-xs text-destructive">
              {error}
            </p>
          )}
          {info && (
            <p className="rounded-2xl bg-primary/10 px-4 py-2 text-xs text-primary">
              {info}
            </p>
          )}
          <Button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
          >
            {busy
              ? "Un momento…"
              : adminDemo ? "Entrar al panel de ejemplo" : mode === "login"
                ? "Iniciar sesión"
                : "Crear cuenta"}
          </Button>
        </form>

        {adminDemo ? <p className="mt-4 text-xs text-muted-foreground">Este acceso es una simulación: cualquier par de datos ficticios abre el panel de ejemplo.</p> : <p className="mt-4 text-center text-xs text-muted-foreground">
          {mode === "login" ? "¿Nuevo por acá? " : "¿Ya eres vecino? "}
          <button
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError(null);
              setInfo(null);
            }}
            className="font-semibold text-primary hover:underline"
          >
            {mode === "login" ? "Crea tu cuenta gratis" : "Inicia sesión"}
          </button>
        </p>}
      </div>
    </div>
  );
}
