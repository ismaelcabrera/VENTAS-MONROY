import { products } from "@/lib/products";

export type AdminProduct = (typeof products)[number] & { sku: string; stock: number; minStock: number; cost: number; active: boolean };
export const demoProducts: AdminProduct[] = products.map((product, index) => ({ ...product, sku: `MON-00${index + 1}`, stock: [42, 8, 65, 24, 0, 12][index] ?? 0, minStock: 15, cost: Math.round(product.price * 0.6), active: true }));
export const demoOrders = [
  { id: "MON-1048", customer: "Camila Rojas", date: "07 oct, 14:32", items: 3, total: 15470, status: "Pendiente" },
  { id: "MON-1047", customer: "Diego Muñoz", date: "07 oct, 13:18", items: 2, total: 10980, status: "Preparando" },
  { id: "MON-1046", customer: "Valentina Soto", date: "07 oct, 12:05", items: 4, total: 21960, status: "Enviado" },
  { id: "MON-1045", customer: "Javier Pérez", date: "06 oct, 18:40", items: 2, total: 8480, status: "Entregado" },
];
export const demoMovements = [
  { id: "1", name: "Maní Salado Tostado", delta: 30, kind: "Entrada", note: "Reposición de proveedor", date: "07 oct, 10:30" },
  { id: "2", name: "Aceitunas Verdes con Hierbas", delta: -3, kind: "Salida", note: "Pedido MON-1048", date: "07 oct, 14:32" },
  { id: "3", name: "Mix de Confites Surtidos", delta: -2, kind: "Ajuste", note: "Recuento de inventario", date: "06 oct, 16:15" },
];