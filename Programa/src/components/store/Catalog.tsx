import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { categories, formatCLP, products } from "@/lib/products";
import { useCart } from "@/lib/cart";

export function Catalog({ query }: { query: string }) {
  const { add } = useCart();
  const [category, setCategory] = useState<(typeof categories)[number]>("Todos");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchesCategory = category === "Todos" || p.category === category;
      const matchesQuery =
        !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  return (
    <section id="catalogo" className="mx-auto max-w-6xl px-4 pt-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            El catálogo de la casa
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {visible.length} productos frescos, listos para llevar
          </p>
        </div>
      </div>

      <div className="no-scrollbar -mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={
              c === category
                ? "shrink-0 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
                : "shrink-0 rounded-full bg-card px-4 py-2.5 text-sm font-medium ring-1 ring-primary/15 transition-colors hover:bg-secondary"
            }
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((p) => (
          <article
            key={p.id}
            className="rounded-[1.5rem] bg-card p-3 shadow-sm ring-1 ring-primary/10 transition-shadow hover:shadow-lg hover:shadow-primary/10"
          >
            <img
              src={p.image}
              alt={p.name}
              width={1024}
              height={1024}
              loading="lazy"
              className="aspect-[5/3] w-full rounded-[1.1rem] object-cover"
            />
            <div className="px-1 pb-1 pt-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                    {p.category}
                  </p>
                  <h3 className="text-base font-medium leading-snug">{p.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {p.description} · {p.unit}
                  </p>
                </div>
                <span className="shrink-0 font-display text-base font-bold">
                  {formatCLP(p.price)}
                </span>
              </div>
              <button
                onClick={() => add(p.id)}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-foreground py-2.5 text-sm font-semibold text-background transition-transform hover:scale-[1.02] active:scale-95"
              >
                <Plus className="size-4" />
                Agregar
              </button>
            </div>
          </article>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="mt-8 rounded-2xl bg-card p-6 text-center text-sm text-muted-foreground ring-1 ring-primary/10">
          No encontramos productos para “{query}”. Prueba con “aceitunas”, “maní”
          o “confites”.
        </p>
      )}
    </section>
  );
}
