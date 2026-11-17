export type StockSnapshot = { id: string; name: string; stock: number; minStock: number; active: boolean };

export function needsDemoAlert(before: StockSnapshot | undefined, after: StockSnapshot): boolean {
  if (!before || !after.active || after.stock >= before.stock) return false;
  return (before.stock > after.minStock && after.stock <= after.minStock) || (before.stock > 0 && after.stock === 0);
}