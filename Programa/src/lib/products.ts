import aceitunasVerdes from "@/assets/aceitunas-verdes.jpg";
import aceitunasNegras from "@/assets/aceitunas-negras.jpg";
import maniSalado from "@/assets/mani-salado.jpg";
import maniConfitado from "@/assets/mani-confitado.jpg";
import mixConfites from "@/assets/mix-confites.jpg";
import almendrasChocolate from "@/assets/almendras-chocolate.jpg";

export interface Product {
  id: string;
  name: string;
  category: "Aceitunas" | "Maní" | "Confites";
  description: string;
  price: number;
  unit: string;
  image: string;
}

export const products: Product[] = [
  {
    id: "aceitunas-verdes",
    name: "Aceitunas Verdes con Hierbas",
    category: "Aceitunas",
    description: "Aliñadas con romero y ajo, directas del barril.",
    price: 4990,
    unit: "500 g",
    image: aceitunasVerdes,
  },
  {
    id: "aceitunas-negras",
    name: "Aceitunas Negras Kalamata",
    category: "Aceitunas",
    description: "En aceite de oliva, suaves y con carácter.",
    price: 5490,
    unit: "500 g",
    image: aceitunasNegras,
  },
  {
    id: "mani-salado",
    name: "Maní Salado Tostado",
    category: "Maní",
    description: "Tostado en casa, crocante y con la sal justa.",
    price: 2990,
    unit: "500 g",
    image: maniSalado,
  },
  {
    id: "mani-confitado",
    name: "Maní Confitado al Caramelo",
    category: "Maní",
    description: "Bañado en caramelo ámbar, dulce y crujiente.",
    price: 3490,
    unit: "400 g",
    image: maniConfitado,
  },
  {
    id: "mix-confites",
    name: "Mix de Confites Surtidos",
    category: "Confites",
    description: "Gomitas y grageas de colores para compartir.",
    price: 3990,
    unit: "500 g",
    image: mixConfites,
  },
  {
    id: "almendras-chocolate",
    name: "Almendras con Chocolate",
    category: "Confites",
    description: "Chocolate amargo y un toque de cacao en polvo.",
    price: 5990,
    unit: "400 g",
    image: almendrasChocolate,
  },
];

export const categories = ["Todos", "Aceitunas", "Maní", "Confites"] as const;

export function formatCLP(value: number): string {
  return "$" + value.toLocaleString("es-CL");
}
