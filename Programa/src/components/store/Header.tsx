import { Search, ShoppingBasket, UserRound } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import peanutIcon from "@/assets/monroy-peanut-icon.jpg";

interface HeaderProps {
  query: string;
  onQueryChange: (q: string) => void;
}

export function Header({ query, onQueryChange }: HeaderProps) {
  const { count, setOpen } = useCart();
  const { user, displayName, setLoginOpen, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-primary/10 bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <img src={peanutIcon} alt="Monroy · maní" width={1024} height={1024} className="size-11 shrink-0 rounded-2xl object-cover" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-semibold leading-none tracking-tight">
            MONROY
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Servicio de ventas generales
          </p>
        </div>

        <label className="hidden h-11 max-w-sm flex-1 items-center gap-2 rounded-full bg-card px-4 ring-1 ring-primary/15 sm:flex">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Busca aceitunas, maní, confites…"
          />
        </label>

        {user ? (
          <button
            onClick={logout}
            className="hidden items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition-transform hover:scale-[1.03] sm:flex"
            title="Cerrar sesión"
          >
            <UserRound className="size-4" />
            <span className="max-w-24 truncate">Hola, {displayName}</span>
          </button>
        ) : (
          <button
            onClick={() => setLoginOpen(true)}
            className="hidden items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition-transform hover:scale-[1.03] sm:flex"
          >
            <UserRound className="size-4" />
            Ingresar
          </button>
        )}

        <button
          onClick={() => setOpen(true)}
          className="relative flex size-11 shrink-0 items-center justify-center rounded-2xl bg-card ring-1 ring-primary/15 transition-transform hover:scale-[1.05]"
          aria-label="Abrir carrito"
        >
          <ShoppingBasket className="size-5" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground ring-2 ring-background">
              {count}
            </span>
          )}
        </button>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-3 sm:hidden">
        <label className="flex h-11 items-center gap-2 rounded-full bg-card px-4 ring-1 ring-primary/15">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Busca aceitunas, maní, confites…"
          />
        </label>
      </div>
    </header>
  );
}
