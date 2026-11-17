import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CartProvider } from "@/lib/cart";
import { AuthProvider } from "@/lib/auth";
import { Header } from "@/components/store/Header";
import { Hero } from "@/components/store/Hero";
import { Catalog } from "@/components/store/Catalog";
import { Benefits } from "@/components/store/Benefits";
import { CartDrawer } from "@/components/store/CartDrawer";
import { LoginDialog } from "@/components/store/LoginDialog";
import { Footer } from "@/components/store/Footer";
import { ChatWidget } from "@/components/store/ChatWidget";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          "Servicio de Ventas Monroy — Aceitunas, Maní y Confites a domicilio",
      },
      {
        name: "description",
        content:
          "Tienda de barrio en línea: aceitunas aliñadas, maní tostado y confites surtidos con despacho el mismo día. Pago seguro y atención personalizada.",
      },
      {
        property: "og:title",
        content: "Servicio de Ventas Monroy — Aceitunas, Maní y Confites",
      },
      {
        property: "og:description",
        content:
          "Aceitunas, maní y confites frescos con despacho a tu barrio. La tienda donde te conocen por tu nombre.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [query, setQuery] = useState("");

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Header query={query} onQueryChange={setQuery} />
          <main>
            <Hero />
            <Catalog query={query} />
            <Benefits />
          </main>
          <Footer />
          <CartDrawer />
          <LoginDialog />
          <ChatWidget />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
