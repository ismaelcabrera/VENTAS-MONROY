export function Footer() {
  return (
    <footer className="mt-16 bg-foreground text-background">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-primary">
              <span className="font-display font-bold text-primary-foreground">
                M
              </span>
            </div>
            <div>
              <p className="font-display font-semibold">MONROY</p>
              <p className="text-xs text-background/60">
                Servicio de ventas generales
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-background/70">
            <a href="#catalogo" className="hover:text-background">
              Catálogo
            </a>
            <span>Envíos</span>
            <span>contacto@monroy.cl</span>
            <span>+56 9 1234 5678</span>
          </div>
        </div>
        <p className="mt-6 font-hand text-xl text-honey">
          Hecho con cariño, como en el barrio.
        </p>
        <p className="mt-3 text-xs text-background/45">
          © 2026 Servicio de Ventas Monroy. Precios en CLP, incluyen IVA.
        </p>
      </div>
    </footer>
  );
}
