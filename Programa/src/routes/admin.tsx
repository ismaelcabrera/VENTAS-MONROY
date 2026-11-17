import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDownLeft, ArrowLeft, ArrowRight, ArrowUpRight, Bell, Check, ChevronRight, Download, LayoutDashboard, Package, Plus, Search, Settings2, ShoppingBag, SlidersHorizontal, Trash2, TriangleAlert, Truck, Pencil, X, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { demoProducts, demoOrders, demoMovements, type AdminProduct } from "@/lib/admin-demo";
import { formatCLP, categories } from "@/lib/products";
import { cn } from "@/lib/utils";
import { PresentationEntry } from "@/components/admin/PresentationEntry";
import { usePresentationEntered, setPresentationEntered } from "@/lib/admin-presentation";
import { PhoneNotifications } from "@/components/admin/PhoneNotifications";
import { useDemoPush } from "@/lib/use-demo-push";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [
    { title: "Administrador · Servicio de Ventas Monroy" },
    { name: "description", content: "Vista de demostración del administrador de Monroy: inventario, movimientos y pedidos." },
    { property: "og:title", content: "Administrador · Servicio de Ventas Monroy" },
    { property: "og:description", content: "Panel de inventario y pedidos de Servicio de Ventas Monroy." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Admin,
});

const sections = [
  { id: "Resumen", icon: LayoutDashboard },
  { id: "Inventario", icon: Package },
  { id: "Movimientos", icon: ArrowLeftRight },
  { id: "Pedidos", icon: ShoppingBag },
  { id: "Notificaciones", icon: Bell },
] as const;
type Section = (typeof sections)[number]["id"];
const fieldClass = "h-10 w-full rounded-md border border-admin-line bg-admin-surface px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30";

function Status({ children, tone = "success" }: { children: React.ReactNode; tone?: "success" | "warning" | "danger" | "info" | "neutral" }) {
  return <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium", tone === "success" && "bg-admin-success-soft text-admin-success", tone === "warning" && "bg-admin-warning-soft text-admin-warning", tone === "danger" && "bg-destructive/10 text-destructive", tone === "info" && "bg-admin-info-soft text-admin-info", tone === "neutral" && "bg-admin-background text-admin-muted")}><span className="size-1.5 rounded-full bg-current" />{children}</span>;
}

function Admin() {
  const entered = usePresentationEntered();
  if (!entered) return <PresentationEntry onEnter={() => setPresentationEntered(true)} />;
  return <AdminPanel onExit={() => setPresentationEntered(false)} />;
}

function AdminPanel({ onExit }: { onExit: () => void }) {
  const [section, setSection] = useState<Section>("Resumen");
  const [products, setProducts] = useState(demoProducts);
  const alerts = useDemoPush(products);
  const [orders, setOrders] = useState(demoOrders);
  const [movements, setMovements] = useState(demoMovements);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [stockFilter, setStockFilter] = useState("Todos");
  const [notice, setNotice] = useState("");
  const [editor, setEditor] = useState<Partial<AdminProduct> | null>(null);
  const [movementOpen, setMovementOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(demoProducts[0]?.id ?? "");
  const [kind, setKind] = useState("Entrada");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<(typeof demoOrders)[number] | null>(null);
  const lowStock = products.filter(p => p.stock <= p.minStock && p.active);
  const units = products.reduce((s, p) => s + p.stock, 0);
  const value = products.reduce((s, p) => s + p.stock * p.cost, 0);
  const filtered = products.filter(p => `${p.name} ${p.sku}`.toLowerCase().includes(query.toLowerCase()) && (category === "Todos" || p.category === category) && (stockFilter === "Todos" || (stockFilter === "Bajo stock" ? p.stock > 0 && p.stock <= p.minStock : p.stock === 0)));
  const go = (s: Section) => { setSection(s); setQuery(""); };

  const exportCSV = () => {
    const csv = ["SKU;Producto;Categoría;Stock;Stock mínimo;Precio;Costo", ...products.map(p => [p.sku, p.name, p.category, p.stock, p.minStock, p.price, p.cost].join(";"))].join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "inventario-monroy-demo.csv"; anchor.click(); URL.revokeObjectURL(url);
    setNotice("Inventario de ejemplo exportado.");
  };

  const saveProduct = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editor) return;
    const form = new FormData(event.currentTarget);
    const product: AdminProduct = {
      id: editor.id ?? `demo-${Date.now()}`, name: String(form.get("name")), sku: String(form.get("sku")),
      category: String(form.get("category")) as AdminProduct["category"], description: String(form.get("description")),
      price: Number(form.get("price")), cost: Number(form.get("cost")), stock: Number(form.get("stock")), minStock: Number(form.get("minStock")), unit: String(form.get("unit")), image: editor.image ?? demoProducts[0]?.image ?? "", active: form.get("active") === "on",
    };
    setProducts(previous => editor.id ? previous.map(p => p.id === editor.id ? product : p) : [...previous, product]);
    setEditor(null); setNotice("Producto guardado en esta demostración.");
  };

  const saveMovement = (event: React.FormEvent) => {
    event.preventDefault();
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;
    const delta = kind === "Entrada" ? quantity : kind === "Salida" ? -quantity : quantity - product.stock;
    if (product.stock + delta < 0) { setNotice("La salida no puede superar el stock disponible."); return; }
    setProducts(previous => previous.map(p => p.id === product.id ? { ...p, stock: p.stock + delta } : p));
    setMovements(previous => [{ id: String(Date.now()), name: product.name, delta, kind, note: note || "Registro manual", date: "Ahora" }, ...previous]);
    setMovementOpen(false); setNote(""); setNotice("Movimiento registrado en esta demostración.");
  };

  const inventoryTable = (compact = false) => <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm">
    <thead className="border-y border-admin-line bg-admin-background/70 text-[11px] text-admin-muted"><tr>{["Producto", "Categoría", "Precio", "Stock", "Estado", ""].map((title, i) => <th key={i} className="px-5 py-3 font-medium">{title}</th>)}</tr></thead>
    <tbody>{(compact ? products.slice(0, 5) : filtered).map(p => <tr key={p.id} className="border-b border-admin-line last:border-b-0 hover:bg-admin-background/60">
      <td className="px-5 py-3.5"><div className="flex items-center gap-3"><img src={p.image} alt={p.name} className="size-10 rounded-md object-cover" /><div><p className="font-medium text-admin-ink">{p.name}</p><p className="mt-0.5 text-[11px] text-admin-muted">{p.sku} · {p.unit}</p></div></div></td>
      <td className="px-5 py-3 text-admin-muted">{p.category}</td><td className="px-5 py-3 font-medium">{formatCLP(p.price)}</td>
      <td className="px-5 py-3"><span className={cn("font-semibold tabular-nums", p.stock <= p.minStock && "text-destructive")}>{p.stock}</span><span className="ml-1 text-xs text-admin-muted">un.</span></td>
      <td className="px-5 py-3"><Status tone={!p.active ? "neutral" : p.stock === 0 ? "danger" : p.stock <= p.minStock ? "warning" : "success"}>{!p.active ? "Inactivo" : p.stock === 0 ? "Agotado" : p.stock <= p.minStock ? "Bajo stock" : "Disponible"}</Status></td>
      <td className="px-3 py-3"><Button variant="ghost" size="icon" title={`Editar ${p.name}`} aria-label={`Editar ${p.name}`} onClick={() => setEditor(p)}><Pencil /></Button></td>
    </tr>)}{!compact && filtered.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-admin-muted">No se encontraron productos.</td></tr>}</tbody>
  </table></div>;

  return <div className="min-h-screen bg-admin-background text-admin-ink">
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-admin-line bg-admin-surface lg:flex">
      <Link to="/" className="flex items-center gap-3 px-6 py-7"><span className="grid size-10 place-items-center rounded-xl bg-primary font-display text-xl font-bold text-primary-foreground">M</span><div><p className="font-display text-lg font-semibold">MONROY</p><p className="text-[10px] text-admin-muted">SERVICIO DE VENTAS</p></div></Link>
      <div className="px-6 pb-3 pt-6 text-[10px] font-semibold uppercase tracking-widest text-admin-muted">Administración</div>
      <nav className="space-y-1 px-3">{sections.map(({ id, icon: Icon }) => <Button key={id} variant="ghost" onClick={() => go(id)} className={cn("h-11 w-full justify-start gap-3 px-3 text-sm font-medium hover:bg-admin-background", section === id ? "bg-primary/10 text-primary hover:bg-primary/10" : "text-admin-muted")}><Icon />{id}{id === "Pedidos" && <span className="ml-auto rounded bg-admin-background px-1.5 text-xs">4</span>}</Button>)}</nav>
      <div className="mx-6 mt-8 border-t border-admin-line pt-6"><p className="text-[10px] font-semibold uppercase tracking-widest text-admin-muted">Accesos rápidos</p><Button variant="ghost" onClick={() => setMovementOpen(true)} className="mt-3 w-full justify-start px-0 text-admin-muted"><Plus />Registrar movimiento</Button><Button asChild variant="ghost" className="w-full justify-start px-0 text-admin-muted"><Link to="/"><ArrowUpRight />Ver tienda</Link></Button></div>
      <div className="mt-auto border-t border-admin-line p-5"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">AM</span><div><p className="text-xs font-semibold">Administrador Monroy</p><p className="mt-1 text-[10px] text-admin-muted">Cuenta de demostración</p></div></div></div>
    </aside>
    <div className="lg:ml-60">
      <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-admin-line bg-admin-surface px-5 py-2 md:px-8"><div className="flex items-center gap-2 text-xs"><span className="text-admin-muted">Administración</span><ChevronRight className="size-3 text-admin-muted" /><span className="font-medium">{section}</span></div><div className="flex items-center gap-2"><span className="rounded-md border border-admin-warning/15 bg-admin-warning-soft px-2 py-1 text-[10px] font-semibold text-admin-warning">Modo demostración</span><Button variant="ghost" size="icon" aria-label="Ver alertas de stock" title="Alertas de stock" onClick={() => { go("Inventario"); setStockFilter("Bajo stock"); }} className="relative"><Bell /><span className="absolute right-2 top-1.5 size-1.5 rounded-full bg-primary" /></Button><Button variant="ghost" size="sm" onClick={onExit}>Salir</Button></div></header>
      <nav className="flex overflow-x-auto border-b border-admin-line bg-admin-surface px-3 py-2 lg:hidden">{sections.map(({ id, icon: Icon }) => <Button key={id} variant="ghost" className={cn("shrink-0 text-xs", section === id && "bg-primary/10 text-primary")} onClick={() => go(id)}><Icon />{id}</Button>)}<Button asChild variant="ghost" size="icon" title="Ver tienda"><Link to="/"><ArrowUpRight /></Link></Button></nav>
      <main className="mx-auto max-w-[1500px] px-5 py-7 md:px-8">
        {notice && <div role="status" className="mb-5 flex items-center justify-between gap-2 rounded-md border border-admin-line bg-admin-surface px-4 py-3 text-sm"><span className="flex items-center gap-2"><Check className="size-4 text-admin-success" />{notice}</span><Button variant="ghost" size="icon" onClick={() => setNotice("")} aria-label="Cerrar aviso"><X /></Button></div>}
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4"><div><div className="mb-2 flex items-center gap-2 text-[11px] text-admin-muted"><span className="h-px w-6 bg-primary" />SERVICIO DE VENTAS MONROY</div><h1 className="text-3xl font-medium">{section === "Resumen" ? "Todo en orden, todo a mano." : section}</h1><p className="mt-2 text-xs text-admin-muted">{section === "Resumen" ? `Un vistazo a tu tienda hoy, ${new Intl.DateTimeFormat('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}.` : section === "Inventario" ? "Productos, existencias y disponibilidad de tu tienda." : section === "Movimientos" ? "Entradas, salidas y ajustes de existencias." : section === "Notificaciones" ? "Registro de tu dispositivo y prueba de avisos." : "El estado de cada pedido, de principio a fin."}</p></div>{section !== "Notificaciones" && <div className="flex gap-2"><Button variant="outline" onClick={exportCSV} className="border-admin-line bg-admin-surface text-xs"><Download />Exportar</Button><Button onClick={() => section === "Movimientos" ? setMovementOpen(true) : setEditor({ active: true })} className="text-xs"><Plus />{section === "Movimientos" ? "Registrar movimiento" : "Nuevo producto"}</Button></div>}</div>

        {section !== "Notificaciones" && alerts.message && <p role="status" className="mb-5 border-l-2 border-admin-info pl-4 text-sm">{alerts.message}</p>}
        <div hidden={section !== "Notificaciones"}><PhoneNotifications alerts={alerts} /></div>
        {section === "Inventario" && <Button variant="outline" className="mb-5" onClick={() => go("Notificaciones")}><Bell />Notificaciones al celular</Button>}

        {(section === "Resumen" || section === "Inventario") && <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">{[
          { label: "Productos en catálogo", value: products.length, detail: `${products.filter(p => p.active).length} productos activos`, icon: Package, tone: "text-primary bg-primary/10" },
          { label: "Unidades disponibles", value: units, detail: "En todas las categorías", icon: ShoppingBag, tone: "text-admin-info bg-admin-info-soft" },
          { label: "Valor del inventario", value: formatCLP(value), detail: "Valor al costo de compra", icon: Truck, tone: "text-admin-success bg-admin-success-soft" },
          { label: "Alertas de stock", value: lowStock.length, detail: `${products.filter(p => p.stock === 0).length} producto agotado`, icon: TriangleAlert, tone: "text-admin-warning bg-admin-warning-soft" },
        ].map(({ label, value: number, detail, icon: Icon, tone }) => <div key={label} className="rounded-lg border border-admin-line bg-admin-surface p-4 md:p-5"><div className="flex items-center justify-between gap-1"><p className="text-[11px] text-admin-muted">{label}</p><span className={cn("grid size-8 shrink-0 place-items-center rounded-md", tone)}><Icon className="size-4" /></span></div><p className="mt-3 text-2xl font-semibold tabular-nums">{number}</p><p className="mt-2 text-[10px] text-admin-muted">{detail}</p></div>)}</div>}

        {section === "Resumen" && <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-md border border-admin-warning/15 bg-admin-warning-soft px-4 py-3"><div className="flex items-center gap-3"><TriangleAlert className="size-5 shrink-0 text-admin-warning" /><p className="text-xs text-admin-warning"><strong>{lowStock.length} productos necesitan atención.</strong> Revisa las existencias antes de tu próxima venta.</p></div><Button variant="ghost" size="sm" className="text-admin-warning hover:bg-admin-warning/10" onClick={() => { go("Inventario"); setStockFilter("Bajo stock"); }}>Revisar stock<ArrowRight /></Button></div>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_290px]">
            <section className="min-w-0"><div className="overflow-hidden rounded-lg border border-admin-line bg-admin-surface"><div className="flex items-center justify-between px-5 py-4"><div><h2 className="text-base font-semibold">Tu inventario</h2><p className="mt-1 text-[11px] text-admin-muted">Los productos que hacen tu tienda</p></div><Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => go("Inventario")}>Ver todos<ArrowRight /></Button></div>{inventoryTable(true)}</div>
            <div className="mt-6"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-medium">Últimos movimientos</h2><Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => go("Movimientos")}>Ver historial<ArrowRight /></Button></div>{movements.slice(0, 3).map(m => <div key={m.id} className="flex items-center gap-3 border-b border-admin-line py-3"><span className={cn("grid size-8 place-items-center rounded-md", m.delta > 0 ? "bg-admin-success-soft text-admin-success" : "bg-admin-info-soft text-admin-info")}>{m.delta > 0 ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}</span><div className="min-w-0 flex-1"><p className="text-xs font-medium">{m.name}</p><p className="mt-1 text-[10px] text-admin-muted">{m.kind} · {m.note}</p></div><div className="text-right"><p className={cn("text-xs font-semibold", m.delta > 0 && "text-admin-success")}>{m.delta > 0 ? "+" : ""}{m.delta} un.</p><p className="mt-1 text-[10px] text-admin-muted">{m.date}</p></div></div>)}</div></section>
            <aside><div className="border-b border-admin-line pb-5"><div className="flex items-center justify-between"><h2 className="text-lg font-medium">Por reponer</h2><span className="text-xs text-admin-muted">{lowStock.length} productos</span></div><div className="mt-2">{lowStock.map(p => <div key={p.id} className="flex items-center gap-3 py-3"><img src={p.image} alt="" className="size-11 rounded-md object-cover" /><div className="min-w-0 flex-1"><p className="text-xs font-medium">{p.name}</p><p className="mt-1 text-[10px] text-admin-muted">Mínimo: {p.minStock} unidades</p></div><span className={cn("text-sm font-semibold", p.stock === 0 ? "text-destructive" : "text-admin-warning")}>{p.stock}</span></div>)}</div><Button variant="outline" className="mt-3 w-full border-admin-line bg-admin-surface text-xs" onClick={() => setMovementOpen(true)}><Plus />Registrar entrada</Button></div>
            <div className="pt-6"><div className="flex items-center justify-between"><h2 className="text-lg font-medium">Pedidos recientes</h2><ShoppingBag className="size-4 text-admin-muted" /></div>{orders.slice(0, 3).map(order => <Button key={order.id} variant="ghost" className="mt-2 h-auto w-full justify-between rounded-none border-b border-admin-line px-0 py-4 text-left hover:bg-admin-background" onClick={() => setSelectedOrder(order)}><span><span className="block text-xs font-semibold">#{order.id}</span><span className="mt-1 block text-[11px] font-normal text-admin-muted">{order.customer}</span></span><span className="text-right"><span className="mb-1.5 block text-xs">{formatCLP(order.total)}</span><Status tone={order.status === "Pendiente" ? "warning" : "info"}>{order.status}</Status></span></Button>)}<Button variant="ghost" className="mt-3 px-0 text-xs text-primary" onClick={() => go("Pedidos")}>Todos los pedidos<ArrowRight /></Button></div></aside>
          </div>
        </>}

        {section === "Inventario" && <section className="overflow-hidden rounded-lg border border-admin-line bg-admin-surface"><div className="flex flex-wrap gap-3 p-5"><label className="flex min-w-[180px] flex-1 items-center gap-2 rounded-md border border-admin-line px-3"><Search className="size-4 text-admin-muted" /><input aria-label="Buscar producto" placeholder="Buscar producto o SKU…" value={query} onChange={e => setQuery(e.target.value)} className="h-10 w-full bg-transparent text-xs outline-none" /></label><select aria-label="Categoría" className={cn(fieldClass, "w-auto text-xs")} value={category} onChange={e => setCategory(e.target.value)}>{categories.map(c => <option key={c}>{c}</option>)}</select><div className="flex items-center gap-2"><SlidersHorizontal className="size-4 text-admin-muted" /><select aria-label="Filtrar stock" className={cn(fieldClass, "w-auto text-xs")} value={stockFilter} onChange={e => setStockFilter(e.target.value)}>{["Todos", "Bajo stock", "Agotados"].map(s => <option key={s}>{s}</option>)}</select></div></div>{inventoryTable()}<p className="border-t border-admin-line px-5 py-3 text-[11px] text-admin-muted">{filtered.length} de {products.length} productos · Datos de ejemplo</p></section>}

        {section === "Movimientos" && <section className="overflow-hidden rounded-lg border border-admin-line bg-admin-surface"><div className="flex items-center justify-between p-5"><h2 className="text-lg">Historial de inventario</h2><span className="text-xs text-admin-muted">{movements.length} movimientos</span></div><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="border-y border-admin-line bg-admin-background text-xs text-admin-muted"><tr>{["Producto", "Tipo", "Cantidad", "Motivo", "Fecha"].map(t => <th key={t} className="px-5 py-3 font-medium">{t}</th>)}</tr></thead><tbody>{movements.map(m => <tr key={m.id} className="border-b border-admin-line last:border-0"><td className="px-5 py-4 font-medium">{m.name}</td><td className="px-5 py-4"><Status tone={m.kind === "Entrada" ? "success" : m.kind === "Ajuste" ? "warning" : "info"}>{m.kind}</Status></td><td className="px-5 py-4 font-semibold">{m.delta > 0 ? "+" : ""}{m.delta}</td><td className="px-5 py-4 text-admin-muted">{m.note}</td><td className="px-5 py-4 text-xs text-admin-muted">{m.date}</td></tr>)}</tbody></table></div></section>}

        {section === "Pedidos" && <section className="overflow-hidden rounded-lg border border-admin-line bg-admin-surface"><div className="flex flex-wrap items-center justify-between gap-3 p-5"><h2 className="text-lg">Todos los pedidos</h2><label className="flex items-center gap-2"><Search className="size-4 text-admin-muted" /><input className={fieldClass} placeholder="Buscar pedido o cliente…" aria-label="Buscar pedido" value={query} onChange={e => setQuery(e.target.value)} /></label></div><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="border-y border-admin-line bg-admin-background text-xs text-admin-muted"><tr>{["Pedido", "Cliente", "Fecha", "Productos", "Total", "Estado", ""].map((t, i) => <th key={i} className="px-5 py-3 font-medium">{t}</th>)}</tr></thead><tbody>{orders.filter(o => `${o.id} ${o.customer}`.toLowerCase().includes(query.toLowerCase())).map(o => <tr key={o.id} className="border-b border-admin-line last:border-0"><td className="px-5 py-4 font-semibold">#{o.id}</td><td className="px-5 py-4">{o.customer}</td><td className="px-5 py-4 text-xs text-admin-muted">{o.date}</td><td className="px-5 py-4">{o.items}</td><td className="px-5 py-4 font-medium">{formatCLP(o.total)}</td><td className="px-5 py-4"><Status tone={o.status === "Pendiente" ? "warning" : o.status === "Entregado" ? "success" : "info"}>{o.status}</Status></td><td><Button variant="ghost" size="icon" aria-label={`Ver pedido ${o.id}`} title="Ver pedido" onClick={() => setSelectedOrder(o)}><ChevronRight /></Button></td></tr>)}</tbody></table></div></section>}
        <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-admin-line pt-4 text-[10px] text-admin-muted"><span>© 2026 Servicio de Ventas Monroy</span><span>Vista de administrador · Datos de ejemplo</span></footer>
      </main>
    </div>

    <Dialog open={editor !== null} onOpenChange={open => { if (!open) setEditor(null); }}><DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto bg-admin-surface text-admin-ink"><DialogHeader><DialogTitle>{editor?.id ? "Editar producto" : "Nuevo producto"}</DialogTitle><DialogDescription>Datos de ejemplo · Los cambios no afectan la tienda real.</DialogDescription></DialogHeader>{editor && <form onSubmit={saveProduct} className="space-y-4"><label className="block text-xs">Nombre<input name="name" required defaultValue={editor.name} className={cn(fieldClass, "mt-1.5")} /></label><div className="grid grid-cols-2 gap-3"><label className="text-xs">SKU<input name="sku" required defaultValue={editor.sku} className={cn(fieldClass, "mt-1.5")} /></label><label className="text-xs">Categoría<select name="category" defaultValue={editor.category ?? "Aceitunas"} className={cn(fieldClass, "mt-1.5")}>{categories.filter(c => c !== "Todos").map(c => <option key={c}>{c}</option>)}</select></label></div><label className="block text-xs">Descripción<input name="description" defaultValue={editor.description} className={cn(fieldClass, "mt-1.5")} /></label><div className="grid grid-cols-2 gap-3">{[{ name: "price", label: "Precio de venta ($)", value: editor.price }, { name: "cost", label: "Costo ($)", value: editor.cost }, { name: "stock", label: "Stock actual", value: editor.stock }, { name: "minStock", label: "Stock mínimo", value: editor.minStock }].map(f => <label key={f.name} className="text-xs">{f.label}<input type="number" min="0" step="1" required name={f.name} defaultValue={f.value ?? 0} className={cn(fieldClass, "mt-1.5")} /></label>)}</div><label className="block text-xs">Presentación<input name="unit" required placeholder="500 g" defaultValue={editor.unit} className={cn(fieldClass, "mt-1.5")} /></label><label className="flex items-center gap-2 text-xs"><input type="checkbox" name="active" defaultChecked={editor.active} className="accent-primary" />Producto activo</label><div className="flex flex-wrap items-center justify-between gap-2 border-t border-admin-line pt-4">{editor.id ? <Button type="button" variant="ghost" className="text-destructive" onClick={() => { setProducts(p => p.filter(item => item.id !== editor.id)); setEditor(null); setNotice("Producto eliminado de la demostración."); }}><Trash2 />Eliminar</Button> : <span />}<div className="flex gap-2"><Button type="button" variant="outline" onClick={() => setEditor(null)}>Cancelar</Button><Button type="submit"><Check />Guardar</Button></div></div></form>}</DialogContent></Dialog>
    <Dialog open={movementOpen} onOpenChange={setMovementOpen}><DialogContent className="w-[calc(100%-2rem)] bg-admin-surface text-admin-ink"><DialogHeader><DialogTitle>Registrar movimiento</DialogTitle><DialogDescription>Registro de ejemplo, sin cambios en el inventario real.</DialogDescription></DialogHeader><form onSubmit={saveMovement} className="space-y-4"><label className="block text-xs">Producto<select className={cn(fieldClass, "mt-1.5")} value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>{products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.stock} un.)</option>)}</select></label><div className="grid grid-cols-2 gap-3"><label className="text-xs">Tipo<select className={cn(fieldClass, "mt-1.5")} value={kind} onChange={e => setKind(e.target.value)}>{["Entrada", "Salida", "Ajuste"].map(k => <option key={k}>{k}</option>)}</select></label><label className="text-xs">{kind === "Ajuste" ? "Stock final" : "Cantidad"}<input type="number" required min={kind === "Ajuste" ? 0 : 1} step="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className={cn(fieldClass, "mt-1.5")} /></label></div><label className="block text-xs">Motivo<input value={note} onChange={e => setNote(e.target.value)} placeholder="Reposición, venta, recuento…" className={cn(fieldClass, "mt-1.5")} /></label><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setMovementOpen(false)}>Cancelar</Button><Button type="submit"><Check />Registrar</Button></div></form></DialogContent></Dialog>
    <Dialog open={selectedOrder !== null} onOpenChange={open => { if (!open) setSelectedOrder(null); }}><DialogContent className="w-[calc(100%-2rem)] bg-admin-surface text-admin-ink"><DialogHeader><DialogTitle>Pedido #{selectedOrder?.id}</DialogTitle><DialogDescription>Pedido de ejemplo · No corresponde a un cliente real.</DialogDescription></DialogHeader>{selectedOrder && <div className="space-y-5"><div className="grid grid-cols-2 gap-4 text-sm"><div><p className="text-xs text-admin-muted">Cliente</p><p className="mt-1">{selectedOrder.customer}</p></div><div><p className="text-xs text-admin-muted">Fecha</p><p className="mt-1">{selectedOrder.date}</p></div><div><p className="text-xs text-admin-muted">Productos</p><p className="mt-1">{selectedOrder.items} unidades</p></div><div><p className="text-xs text-admin-muted">Total</p><p className="mt-1 font-semibold">{formatCLP(selectedOrder.total)}</p></div></div><label className="block text-xs">Estado<select value={selectedOrder.status} onChange={e => setSelectedOrder({ ...selectedOrder, status: e.target.value })} className={cn(fieldClass, "mt-2")}>{["Pendiente", "Preparando", "Enviado", "Entregado", "Cancelado"].map(s => <option key={s}>{s}</option>)}</select></label><Button className="w-full" onClick={() => { setOrders(previous => previous.map(o => o.id === selectedOrder.id ? selectedOrder : o)); setSelectedOrder(null); setNotice("Estado del pedido actualizado en esta demostración."); }}><Check />Guardar estado</Button></div>}</DialogContent></Dialog>
  </div>;
}