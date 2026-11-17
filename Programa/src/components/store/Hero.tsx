import { ArrowRight, BadgeCheck, ShieldCheck, Star } from "lucide-react";
import hero from "@/assets/hero.jpg";

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-6">
      <div className="relative overflow-hidden rounded-[2rem] ring-1 ring-primary/10">
        <img
          src={hero}
          alt="Interior acogedor de la tienda Monroy con frascos de aceitunas, maní y confites"
          width={1600}
          height={1000}
          className="aspect-[16/10] w-full object-cover sm:aspect-[21/9]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
          <p className="font-hand text-2xl text-honey sm:text-3xl">
            ¡Hola, vecino!
          </p>
          <h1 className="mt-1 max-w-xl text-balance text-3xl font-semibold leading-tight text-primary-foreground sm:text-5xl">
            Aceitunas, maní y confites, como los de antes
          </h1>
          <p className="mt-3 max-w-md text-pretty text-sm text-primary-foreground/85 sm:text-base">
            En Servicio de Ventas Monroy pesamos al gramo, probamos cada tanda
            y te atendemos por tu nombre.
          </p>
          <a
            href="#catalogo"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary py-3 pl-6 pr-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/40 transition-transform hover:scale-[1.03]"
          >
            Ver el catálogo
            <ArrowRight className="size-4" />
          </a>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {[
          { icon: BadgeCheck, text: "+1.200 vecinos felices" },
          { icon: ShieldCheck, text: "Pago protegido" },
          { icon: Star, text: "4.8 de 5 estrellas" },
        ].map(({ icon: Icon, text }) => (
          <span
            key={text}
            className="inline-flex items-center gap-2 rounded-full bg-card py-1.5 pl-1.5 pr-3 text-xs font-semibold text-muted-foreground ring-1 ring-primary/15"
          >
            <span className="grid size-5 place-items-center rounded-full bg-honey/30">
              <Icon className="size-3 text-primary" />
            </span>
            {text}
          </span>
        ))}
      </div>
    </section>
  );
}
