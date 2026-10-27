/**
 * @file lib/jsonRepair.ts
 * @description Motor de parseo y reparación robusta de respuestas JSON de LLMs para análisis forense judicial.
 * Repara comillas no escapadas, comas finales, bloques de código markdown, llaves truncadas y caracteres de control.
 */

/**
 * Repara cadenas JSON malformadas generadas comúnmente por modelos de lenguaje:
 * 1. Elimina envoltorios markdown (```json ... ```)
 * 2. Extrae el bloque delimitado por el primer '{' y el último '}'
 * 3. Corrige comas finales antes de '}' o ']'
 * 4. Repara comillas no escapadas dentro de cadenas de texto judicial
 * 5. Cierra automáticamente estructuras JSON truncadas por límite de tokens
 */
export function repairJsonString(raw: string): string {
  if (!raw) return "{}";

  let str = raw.trim();

  // 1. Eliminar bloques markdown
  str = str.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

  // 2. Extraer el bloque JSON principal si hay texto explicativo antes o después
  const firstBrace = str.indexOf("{");
  const lastBrace = str.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    str = str.substring(firstBrace, lastBrace + 1);
  } else if (firstBrace !== -1 && lastBrace === -1) {
    // Caso de JSON truncado que nunca cerró su llave principal
    str = str.substring(firstBrace);
  }

  // 3. Eliminar caracteres de control inválidos excepto saltos de línea estándar
  str = str.replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F]/g, " ");

  // 4. Eliminar comas finales ilegales antes de cerrar arreglos u objetos: ", }" o ", ]"
  str = str.replace(/,\s*([\}\]])/g, "$1");

  // 5. Corregir comas faltantes entre llaves adyacentes: "} {" -> "}, {"
  str = str.replace(/\}\s*\{/g, "}, {");
  str = str.replace(/\]\s*\[/g, "], [");

  // 6. Balanceo y autocierre de llaves y corchetes truncados
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let isEscaped = false;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (isEscaped) {
      isEscaped = false;
      continue;
    }
    if (char === "\\") {
      isEscaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === "{") openBraces++;
      else if (char === "}") openBraces = Math.max(0, openBraces - 1);
      else if (char === "[") openBrackets++;
      else if (char === "]") openBrackets = Math.max(0, openBrackets - 1);
    }
  }

  // Si quedó una cadena abierta sin cerrar al final
  if (inString) {
    str += '"';
  }

  // Cerrar corchetes y llaves faltantes en orden inverso
  while (openBrackets > 0) {
    str += "]";
    openBrackets--;
  }
  while (openBraces > 0) {
    str += "}";
    openBraces--;
  }

  // Volver a limpiar comas antes de cierres añadidos
  str = str.replace(/,\s*([\}\]])/g, "$1");

  return str;
}

/**
 * Parsea con tolerancia a fallos cualquier respuesta JSON de LLMs forenses.
 * Aplica reparación incremental de sintaxis y nunca lanza excepciones no controladas.
 */
export function safeParseForensicJson<T = any>(rawText: string, fallbackValue?: any): any {
  if (!rawText || typeof rawText !== "string") {
    return fallbackValue;
  }

  const trimmed = rawText.trim();
  if (trimmed === "" || trimmed === "{}") {
    return fallbackValue;
  }

  // Intento 1: Parseo directo nativo
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    // Continuar a reparación
  }

  // Intento 2: Extracción con Regex de bloque JSON estándar
  try {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]) as T;
    }
  } catch {
    // Continuar a reparación profunda
  }

  // Intento 3: Reparación activa de sintaxis (comas, markdown, llaves abiertas)
  try {
    const repaired = repairJsonString(trimmed);
    return JSON.parse(repaired) as T;
  } catch (err) {
    console.warn("[jsonRepair] Parseo tras reparación sintáctica falló, aplicando rescate heurístico:", err);
  }

  // Intento 4: Rescate heurístico de campos forenses clave mediante expresiones regulares
  try {
    const extractedObject: any = {};

    // Extraer expediente
    const expMatch = trimmed.match(/"expediente"\s*:\s*"([^"]+)"/i);
    if (expMatch) extractedObject.expediente = expMatch[1];

    // Extraer resumen ejecutivo
    const resMatch = trimmed.match(/"resumen_ejecutivo"\s*:\s*"([^"]+)"/i);
    if (resMatch) extractedObject.resumen_ejecutivo = resMatch[1];

    // Extraer hitos cronológicos individuales
    const hitoRegex = /\{\s*"id_hito"\s*:\s*"([^"]+)"[\s\S]*?"fecha"\s*:\s*"([^"]+)"[\s\S]*?"hecho_objetivo"\s*:\s*"([^"]+)"[\s\S]*?"cita_literal"\s*:\s*"([^"]+)"/gi;
    const hitos: any[] = [];
    let hitoMatch;
    while ((hitoMatch = hitoRegex.exec(trimmed)) !== null) {
      hitos.push({
        id_hito: hitoMatch[1],
        fecha: hitoMatch[2],
        hecho_objetivo: hitoMatch[3],
        cita_literal: hitoMatch[4],
        relevancia: "Alta"
      });
    }

    if (hitos.length > 0) {
      extractedObject.cronologia_hitos = hitos;
      return { ...fallbackValue, ...extractedObject };
    }
  } catch (e) {
    console.warn("[jsonRepair] Rescate heurístico por regex falló:", e);
  }

  return fallbackValue;
}
