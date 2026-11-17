import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const sendChatMessage = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        messages: z
          .array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string().min(1).max(2000),
            }),
          )
          .min(1)
          .max(40),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    // Tomamos el último mensaje del usuario
    const lastMessage = data.messages[data.messages.length - 1].content.toLowerCase();
    
    let reply = "¡Hola! En Servicio de Ventas Monroy tenemos aceitunas, maní, confites y almendras con chocolate. ¿En qué te puedo ayudar?";

    // Lógica inteligente local basada en tu catálogo y reglas para la presentación
    if (lastMessage.includes("dulce") || lastMessage.includes("recomiendas") || lastMessage.includes("chocolate")) {
      reply = "¡Te recomiendo nuestras Almendras con Chocolate ($5.990 / 400g) o el Maní Confitado al Caramelo ($3.490 / 400g)! Son exquisitos.";
    } else if (lastMessage.includes("salado") || lastMessage.includes("aceituna") || lastMessage.includes("maní")) {
      reply = "Para algo salado tenemos las Aceitunas Verdes con Hierbas ($4.990) y el Maní Salado Tostado en casa ($2.990 / 500g). ¡Son los favoritos del barrio!";
    } else if (lastMessage.includes("despacho") || lastMessage.includes("envio") || lastMessage.includes("enviar")) {
      reply = "Hacemos despachos el mismo día dentro del barrio si pides antes de las 18:00. El envío cuesta $1.990, ¡y es gratis en pedidos sobre $20.000!";
    } else if (lastMessage.includes("horario") || lastMessage.includes("abierto") || lastMessage.includes("hora")) {
      reply = "Atendemos de lunes a sábado de 9:00 a 20:00. También puedes elegir retiro en tienda sin costo.";
    } else if (lastMessage.includes("pago") || lastMessage.includes("pagar") || lastMessage.includes("transferencia")) {
      reply = "Puedes pagar en efectivo, con tarjeta o mediante transferencia al recibir tu pedido.";
    }

    return { reply };
  });