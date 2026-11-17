import { useState } from "react";
import { CheckCircle2, Minus, Plus, Trash2, X, CreditCard, MapPin, Loader2 } from "lucide-react";
import { formatCLP } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";

const FREE_SHIPPING = 25000;

export function CartDrawer() {
  const { lines, total, isOpen, setOpen, setQty, remove, clear } = useCart();
  const { user, setLoginOpen } = useAuth();
  const [checkout, setCheckout] = useState(false);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  if (!isOpen) return null;

  const shipping = total === 0 || total >= FREE_SHIPPING ? 0 : 2990;
  const finalTotal = total + shipping;

  // Función para obtener la ubicación con navigator.geolocation
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      return setError("Tu navegador no soporta geolocalización.");
    }

    setLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Geocodificación inversa gratuita con OpenStreetMap Nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { "Accept-Language": "es" } }
          );
          const data = await res.json();
          if (data && data.display_name) {
            // Tomamos una versión más limpia de la dirección devuelta
            setAddress(data.display_name);
          } else {
            setAddress(`Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`);
          }
        } catch (err) {
          // Si falla el fetch por red, al menos ponemos las coordenadas exactas
          setAddress(`Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`);
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        console.error(err);
        setLocating(false);
        setError("No pudimos obtener tu ubicación. Revisa los permisos.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSimulatedCheckout = () => {
    if (!user) return setLoginOpen(true);
    if (address.trim().length < 5) return setError("Ingresa tu dirección de entrega.");

    setBusy(true);
    setError(null);

    const fakeId = Math.random().toString(36).substring(2, 10).toUpperCase();

    setTimeout(() => {
      setOrderId(fakeId);
      setBusy(false);
      clear();
      setCheckout(false);
      setAddress("");
      setPhone("");
      setNotes("");

      window.open("https://www.mercadopago.cl", "_blank");
      setOpen(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Cerrar carrito"
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-primary/10 px-5 py-4">
          <div>
            <p className="font-hand text-2xl leading-none text-primary">
              Tu carrito
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {lines.length === 0
                ? "Todavía está vacío"
                : `${lines.length} producto${lines.length > 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="grid size-10 place-items-center rounded-full bg-secondary transition-transform hover:scale-105"
            aria-label="Cerrar"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {orderId && (
            <div className="rounded-2xl bg-primary/10 p-5 text-center ring-1 ring-primary/20">
              <CheckCircle2 className="mx-auto size-8 text-primary" />
              <p className="mt-2 font-hand text-2xl text-primary">
                ¡Pedido registrado con éxito!
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Nº {orderId} · Redirigiendo a pasarela de Mercado Pago.
              </p>
            </div>
          )}
          {lines.length === 0 && !orderId && (
            <p className="rounded-2xl bg-card p-6 text-center text-sm text-muted-foreground ring-1 ring-primary/10">
              Agrega aceitunas, maní o confites desde el catálogo. 🫒
            </p>
          )}
          {lines.map(({ product, qty }) => (
            <div
              key={product.id}
              className="flex items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-primary/10"
            >
              <img
                src={product.image}
                alt={product.name}
                width={1024}
                height={1024}
                loading="lazy"
                className="size-16 shrink-0 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatCLP(product.price)} · {product.unit}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => setQty(product.id, qty - 1)}
                    className="grid size-7 place-items-center rounded-full bg-secondary"
                    aria-label="Quitar uno"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(product.id, qty + 1)}
                    className="grid size-7 place-items-center rounded-full bg-secondary"
                    aria-label="Agregar uno"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <span className="font-display text-sm font-bold">
                  {formatCLP(product.price * qty)}
                </span>
                <button
                  onClick={() => remove(product.id)}
                  className="grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Eliminar ${product.name}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-primary/10 px-5 py-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCLP(total)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Envío</span>
                <span>{shipping === 0 ? "Gratis" : formatCLP(shipping)}</span>
              </div>
              <div className="flex justify-between pt-1 font-display text-lg font-semibold">
                <span>Total</span>
                <span>{formatCLP(finalTotal)}</span>
              </div>
            </div>
            {checkout && user && (
              <div className="mt-4 space-y-3">
                {/* Botón chori para usar geolocalización */}
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={locating}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-secondary/80 py-2.5 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary disabled:opacity-50"
                >
                  {locating ? (
                    <Loader2 className="size-3.5 animate-spin text-primary" />
                  ) : (
                    <MapPin className="size-3.5 text-primary" />
                  )}
                  {locating ? "Obteniendo ubicación GPS..." : "Usar mi ubicación actual 📍"}
                </button>

                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-11 w-full rounded-full bg-card px-4 text-sm outline-none ring-1 ring-input focus:ring-2 focus:ring-ring"
                  placeholder="Dirección de entrega"
                />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11 w-full rounded-full bg-card px-4 text-sm outline-none ring-1 ring-input focus:ring-2 focus:ring-ring"
                  placeholder="Teléfono de contacto"
                />
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-2xl bg-card px-4 py-3 text-sm outline-none ring-1 ring-input focus:ring-2 focus:ring-ring"
                  placeholder="Comentarios (opcional)"
                />
              </div>
            )}
            {error && (
              <p className="mt-3 rounded-2xl bg-destructive/10 px-4 py-2 text-xs text-destructive">
                {error}
              </p>
            )}
            <button
              onClick={() => {
                setOrderId(null);
                if (!user) return setLoginOpen(true);
                if (!checkout) return setCheckout(true);
                handleSimulatedCheckout();
              }}
              disabled={busy}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#009EE3] py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/20 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
            >
              <CreditCard className="size-4" />
              {!user
                ? "Inicia sesión para pagar"
                : busy
                  ? "Conectando con Mercado Pago..."
                  : checkout
                    ? `Pagar ${formatCLP(finalTotal)} con Mercado Pago`
                    : "Continuar al pago"}
            </button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Envío gratis sobre {formatCLP(FREE_SHIPPING)} · Pago seguro con Mercado Pago
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}