import { CreditCard, MessagesSquare, Truck } from "lucide-react";

const benefits = [
  {
    icon: Truck,
    title: "Envíos a tu barrio",
    text: "Gratis sobre $25.000, el mismo día en Santiago.",
    tint: "bg-honey/30",
  },
  {
    icon: CreditCard,
    title: "Pago seguro",
    text: "Con tarjeta en línea o paga al recibir.",
    tint: "bg-primary/15",
  },
  {
    icon: MessagesSquare,
    title: "Atención de verdad",
    text: "Te respondemos por WhatsApp, con nombre y apellido.",
    tint: "bg-olive/20",
  },
];

export function Benefits() {
  return (
    <section className="mx-auto mt-12 max-w-6xl px-4">
      <div className="rounded-[1.5rem] bg-primary/10 p-6 ring-1 ring-primary/15 sm:p-8">
        <h2 className="text-2xl font-semibold tracking-tight">
          Comprar en el barrio
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Cercano, confiable y siempre pensando en ti.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {benefits.map(({ icon: Icon, title, text, tint }) => (
            <div
              key={title}
              className="flex items-center gap-3 rounded-2xl bg-card/80 p-4"
            >
              <span
                className={`grid size-11 shrink-0 place-items-center rounded-2xl ${tint}`}
              >
                <Icon className="size-5 text-primary" />
              </span>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
