/**
 * @file src/lib/whatsappParser.ts
 * @description Preprocesador local determinista para exportaciones de chat de WhatsApp (.txt).
 * Elimina mensajes del sistema, agrupa mensajes consecutivos del mismo interlocutor y estructura
 * los bloques cronológicos antes de enviarlos a la API para ahorrar tokens y garantizar precisión 1:1.
 */

export interface ParsedWhatsAppMessage {
  timestamp: string;
  sender: string;
  content: string;
}

export interface WhatsAppPreprocessResult {
  isWhatsApp: boolean;
  totalOriginalLines: number;
  filteredSystemLines: number;
  groupedMessageCount: number;
  cleanedText: string;
  senders: string[];
  dateRange: { start: string; end: string };
}

// Patrones de fecha/hora comunes en exportaciones de WhatsApp en español e inglés:
// 1. [12/04/24, 11:22:10] Valentina: mensaje
// 2. 12/04/2024, 11:22 - Valentina: mensaje
// 3. [12/4/24, 11:22:10 a. m.] Valentina Silva: mensaje
// 4. 12/4/2024, 11:22 a. m. - Valentina: mensaje
// 5. 12.04.24, 11:22 - Valentina: mensaje
const WA_LINE_REGEX =
  /^(?:\[?(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}[,\s]+\d{1,2}:\d{2}(?::\d{2})?(?:\s*[ap]\.?\s*m\.?)?)\]?(?:\s*-\s*|\s*:\s*|\s+))([^:]+):\s*(.+)$/i;

// Mensajes estándar del sistema de WhatsApp a descartar
const SYSTEM_MESSAGE_PATTERNS = [
  /cifrad[oa]s? de extremo a extremo/i,
  /end-to-end encrypt/i,
  /código de seguridad cambió/i,
  /security code changed/i,
  /<multimedia omitido>/i,
  /<media omitted>/i,
  /<archivo adjunto omitido>/i,
  /<attached:.*>/i,
  /creó este grupo/i,
  /created group/i,
  /cambió el ícono/i,
  /cambió la descripción/i,
  /cambió el nombre/i,
  /cambió el asunto/i,
  /añadió a/i,
  /added/i,
  /eliminó a/i,
  /removed/i,
  /salió del grupo/i,
  /left the group/i,
  /se unió usando/i,
  /joined using/i,
  /llamada perdida/i,
  /missed call/i,
  /videollamada perdida/i,
  /este mensaje fue eliminado/i,
  /this message was deleted/i
];

export function isWhatsAppSystemMessage(text: string): boolean {
  return SYSTEM_MESSAGE_PATTERNS.some((pattern) => pattern.test(text));
}

/**
 * Procesa un texto plano y verifica si corresponde a una exportación de WhatsApp.
 * Si es así, limpia el ruido del sistema y agrupa ráfagas de mensajes del mismo emisor.
 */
export function parseAndCleanWhatsAppExport(rawText: string): WhatsAppPreprocessResult {
  const lines = rawText.split(/\r?\n/);
  let waMatchCount = 0;

  // Chequeo rápido de coincidencia en las primeras líneas
  for (let i = 0; i < Math.min(lines.length, 30); i++) {
    if (WA_LINE_REGEX.test(lines[i].trim())) {
      waMatchCount++;
    }
  }

  const isWhatsApp = waMatchCount >= 2;
  if (!isWhatsApp) {
    return {
      isWhatsApp: false,
      totalOriginalLines: lines.length,
      filteredSystemLines: 0,
      groupedMessageCount: 0,
      cleanedText: rawText,
      senders: [],
      dateRange: { start: "", end: "" }
    };
  }

  const parsedMessages: ParsedWhatsAppMessage[] = [];
  let filteredSystemLines = 0;
  let currentMessage: ParsedWhatsAppMessage | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const match = line.match(WA_LINE_REGEX);

    if (match) {
      const timestamp = match[1].trim();
      const sender = match[2].trim();
      const content = match[3].trim();

      // Descartar mensajes de sistema automáticos
      if (isWhatsAppSystemMessage(content) || isWhatsAppSystemMessage(sender)) {
        filteredSystemLines++;
        continue;
      }

      if (currentMessage) {
        parsedMessages.push(currentMessage);
      }

      currentMessage = {
        timestamp,
        sender,
        content
      };
    } else {
      // Continuación multilínea de mensaje anterior
      if (currentMessage) {
        if (!isWhatsAppSystemMessage(line)) {
          currentMessage.content += `\n${line}`;
        } else {
          filteredSystemLines++;
        }
      }
    }
  }

  if (currentMessage) {
    parsedMessages.push(currentMessage);
  }

  // Agrupar mensajes consecutivos del mismo interlocutor en un único bloque cronológico
  const grouped: ParsedWhatsAppMessage[] = [];
  const sendersSet = new Set<string>();

  for (const msg of parsedMessages) {
    sendersSet.add(msg.sender);

    if (grouped.length === 0) {
      grouped.push({ ...msg });
    } else {
      const last = grouped[grouped.length - 1];
      if (last.sender.toLowerCase() === msg.sender.toLowerCase()) {
        last.content += `\n${msg.content}`;
      } else {
        grouped.push({ ...msg });
      }
    }
  }

  // Generar formato estructurado de alta precisión para el análisis pericial
  const formattedBlocks = grouped.map(
    (m) => `[${m.timestamp}] ${m.sender}:\n"${m.content.trim()}"`
  );

  const cleanedText = `=== REGISTRO DE CONVERSACIÓN WHATSAPP (DEPURADO LOCALMENTE) ===\nInterlocutores Identificados: ${Array.from(sendersSet).join(", ")}\nTotal Mensajes Agrupados: ${grouped.length} (Se filtraron ${filteredSystemLines} avisos de sistema)\n\n${formattedBlocks.join("\n\n")}`;

  return {
    isWhatsApp: true,
    totalOriginalLines: lines.length,
    filteredSystemLines,
    groupedMessageCount: grouped.length,
    cleanedText,
    senders: Array.from(sendersSet),
    dateRange: {
      start: grouped[0]?.timestamp || "",
      end: grouped[grouped.length - 1]?.timestamp || ""
    }
  };
}
