import { AnalysisResult, UploadedFile } from "../types/ediscovery";

export interface PreloadedCase {
  id: string;
  title: string;
  category: string;
  description: string;
  suggestedContext: string;
  files: UploadedFile[];
  precomputedResult: AnalysisResult;
}

export const SAMPLE_CASES: PreloadedCase[] = [
  {
    id: "disputa-contractual",
    title: "Disputa Comercial y Obras Adicionales",
    category: "Derecho Civil / Comercial",
    description: "Contrato de remodelación, chats de WhatsApp de autorización de plazo y posterior carta notarial de rescisión por supuesto abandono.",
    suggestedContext: "Disputa entre Inversiones Los Robles y Constructora Delta. La contratista aduce que el retraso fue autorizado por WhatsApp por demoras de aduana, mientras el mandante cursó carta notarial imputando abandono culpable e intentando cobrar cláusula penal de $15,000 USD.",
    files: [
      {
        id: "doc-1",
        name: "Contrato_Marco_Remodelacion_2024.pdf",
        type: "application/pdf",
        size: 142000,
        sha256: "4a8f1e29c0d38b5719e7a2b0c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2",
        textContent: `CONTRATO DE ARRENDAMIENTO DE SERVICIOS Y OBRA CIVIL
Fecha: 15 de enero de 2024
Partes: Inversiones Los Robles SpA (Comitente) representada por don Rodrigo Morales, y Constructora Delta S.A.S. (Contratista) representada por la Arq. Valentina Silva.
CLÁUSULA TERCERA - PLAZO: El plazo total de entrega de las oficinas habilitadas será de 120 días corridos a contar del desembolso del anticipo pactado.
CLÁUSULA NOVENA - MODIFICACIONES: Todo trabajo adicional o ampliación presupuestaria requerirá orden escrita firmada por la supervisión técnica con carácter previo a su ejecución.
CLÁUSULA DÉCIMA - PENALIDADES: En caso de mora culpable o abandono injustificado de faena, se fija una cláusula penal compensatoria no acumulable de $15,000 USD.`,
        category: "contract"
      },
      {
        id: "doc-2",
        name: "WhatsApp_Chat_Rodrigo_Valentina_Abril.png",
        type: "text/plain",
        size: 45000,
        sha256: "c83f91a2b4e5d6c708192a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d",
        textContent: `[REGISTRO EXTRACCIÓN WHATSAPP - CONVERSACIÓN DIR. OPERACIONES Y DIR. OBRA]
[12/04/2024 11:22:10] Valentina Silva: Rodrigo, buenos días. Te comento que la perfilería de aluminio y los vidrios acústicos del piso 4 están retenidos en puerto por el paro de aduanas. Tenemos un 70% avanzado pero esto nos frena 3 semanas. Necesitamos prorrogar 25 días la fecha de término sin penalizaciones para poder entregar con calidad.
[12/04/2024 11:45:04] Rodrigo Morales: Hola Valentina, entendido. No hay problema con los 25 días adicionales considerando que es fuerza mayor por la aduana. Procedan con los demás frentes y mándame la factura del hito 2 para tramitar el pago con tesorería el viernes.
[12/04/2024 11:46:12] Valentina Silva: Excelente Rodrigo, muchas gracias por la comprensión. Seguimos con cableado y cielo falso.`,
        category: "chat"
      },
      {
        id: "doc-3",
        name: "Carta_Notarial_Resolucion_Agosto.pdf",
        type: "application/pdf",
        size: 98000,
        sha256: "e19a4b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a",
        textContent: `NOTARÍA PÚBLICA DÉCIMO CUARTA - CARTA NOTARIAL DE REQUERIMIENTO Y RESOLUCIÓN
Santiago de Chile, 28 de agosto de 2024
A: CONSTRUCTORA DELTA S.A.S.
DE: INVERSIONES LOS ROBLES SpA
Por medio de la presente, comunicamos que en atención al vencimiento fatal del plazo contractual de 120 días y verificándose un abandono doloso e injustificado de las obras a partir del 15 de mayo de 2024 sin que mediara aviso ni justificación alguna, hacemos efectiva la resolución inmediata del contrato con cobro íntegro de la fianza y de la cláusula penal por $15,000 USD fijada en la cláusula décima.`,
        category: "contract"
      },
      {
        id: "doc-4",
        name: "Email_Reclamo_Adicionales_Junio.txt",
        type: "text/plain",
        size: 28000,
        sha256: "8f7e6d5c4b3a2019e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2019e8d7c6b5a4f",
        textContent: `De: valentina.silva@constructoradelta.com
Para: rodrigo.morales@losrobles.com
Fecha: 05 de Junio de 2024, 14:00 hrs
Asunto: URGENTE: Mayores costos estructurales y paralización preventiva por falta de pago de adicionales $8,200 USD

Estimado Rodrigo:
Tal como te informé verbalmente la semana pasada en terreno, tuvimos que reforzar las vigas de soporte de la sala de servidores debido a grietas preexistentes en su losa. El costo directo de mano de obra y materiales asciende a $8,200 USD. Exigimos la regularización inmediata de este importe o nos veremos forzados a reducir el personal de obra.`,
        category: "email"
      }
    ],
    precomputedResult: {
      resumen_caso: {
        titulo_caso: "Disputa Comercial y Obras Adicionales: Los Robles vs. Constructora Delta",
        resumen_ejecutivo: "El acervo probatorio aportado examina el cumplimiento del contrato de remodelación de oficinas corporativas suscrito el 15 de enero de 2024. Se observa una contradicción de alta gravedad entre la Carta Notarial de agosto de 2024 (que imputa abandono doloso de obras desde mayo) y el registro verificado de WhatsApp de abril de 2024, donde el Gerente de Operaciones autorizó por escrito una prórroga de 25 días corridos con motivo de contingencias aduaneras.",
        periodo_temporal: {
          inicio: "15 de Enero de 2024",
          fin: "28 de Agosto de 2024"
        },
        partes_identificadas: [
          {
            nombre: "Rodrigo Morales",
            rol: "Gerente de Operaciones",
            detalles: "Representante técnico y administrativo de Inversiones Los Robles SpA."
          },
          {
            nombre: "Arq. Valentina Silva",
            rol: "Directora de Obra",
            detalles: "Supervisora ejecutiva de faena en Constructora Delta S.A.S."
          }
        ]
      },
      cronologia: [
        {
          id: "H-001",
          fecha_hora: "2024-01-15 09:30",
          hecho: "Celebración del contrato marco de remodelación con fijación de plazo de 120 días y cláusula penal de $15,000 USD.",
          personas_involucradas: ["Rodrigo Morales", "Valentina Silva"],
          fuente_documental: "Contrato_Marco_Remodelacion_2024.pdf",
          cita_o_referencia: "Cláusula Tercera: 'El plazo total de entrega de las oficinas habilitadas será de 120 días corridos a contar del desembolso del anticipo pactado.'",
          relevancia: "Alta",
          tipo_evento: "Suscripción Contractual",
          analisis_procesal: "Base normativa de la relación jurídica y fijación del estándar de exigibilidad."
        },
        {
          id: "H-002",
          fecha_hora: "2024-04-12 11:22",
          hecho: "La Directora de Obra comunica avance al 70% y solicita formalmente prórroga de 25 días por retención aduanera de materiales.",
          personas_involucradas: ["Valentina Silva", "Rodrigo Morales"],
          fuente_documental: "WhatsApp_Chat_Rodrigo_Valentina_Abril.png",
          cita_o_referencia: "'Tenemos un 70% avanzado pero esto nos frena 3 semanas. Necesitamos prorrogar 25 días la fecha de término sin penalizaciones'",
          relevancia: "Alta",
          tipo_evento: "Solicitud de Prórroga",
          analisis_procesal: "Acredita diligencia de la contratista informando oportunamente el hecho impeditivo."
        },
        {
          id: "H-003",
          fecha_hora: "2024-04-12 11:45",
          hecho: "El Gerente de Operaciones concede y autoriza expresamente la prórroga de 25 días sin penalidades a través de mensajería electrónica.",
          personas_involucradas: ["Rodrigo Morales", "Valentina Silva"],
          fuente_documental: "WhatsApp_Chat_Rodrigo_Valentina_Abril.png",
          cita_o_referencia: "'Hola Valentina, entendido. No hay problema con los 25 días adicionales... mándame la factura del hito 2'",
          relevancia: "Alta",
          tipo_evento: "Concesión de Plazo",
          analisis_procesal: "Desvirtúa la acusación de mora y constituye consentimiento vinculante entre representantes con facultades."
        },
        {
          id: "H-004",
          fecha_hora: "2024-06-05 14:00",
          hecho: "Reclamo por correo de mayores costos estructurales por $8,200 USD amenazando con reducción de personal.",
          personas_involucradas: ["Valentina Silva", "Rodrigo Morales"],
          fuente_documental: "Email_Reclamo_Adicionales_Junio.txt",
          cita_o_referencia: "'El costo directo de mano de obra y materiales asciende a $8,200 USD. Exigimos la regularización inmediata...'",
          relevancia: "Media",
          tipo_evento: "Reclamación Extrajudicial",
          analisis_procesal: "Inicio de la controversia pecuniaria sobre adiciones no formalizadas por adenda."
        },
        {
          id: "H-005",
          fecha_hora: "2024-08-28 12:00",
          hecho: "Remisión de Carta Notarial rescindiendo el contrato y pretendiendo el cobro de la penalidad de $15,000 USD alegando abandono culpable.",
          personas_involucradas: ["Inversiones Los Robles SpA", "Constructora Delta S.A.S."],
          fuente_documental: "Carta_Notarial_Resolucion_Agosto.pdf",
          cita_o_referencia: "'...verificándose un abandono doloso e injustificado de las obras a partir del 15 de mayo de 2024 sin que mediara aviso ni justificación alguna...'",
          relevancia: "Alta",
          tipo_evento: "Resolución Notarial",
          analisis_procesal: "Acto procesal en franca contradicción con los consentimientos previos vertidos en WhatsApp."
        }
      ],
      contradicciones: [
        {
          id: "C-001",
          titulo: "Abandono Injustificado Notarial vs. Autorización Expresa de Prórroga en Chat",
          hecho_a: {
            declaracion: "La contratista incurrió en un abandono doloso e injustificado de las obras sin mediar justificación alguna.",
            fuente: "Carta_Notarial_Resolucion_Agosto.pdf (28/08/2024)",
            autor_o_parte: "Inversiones Los Robles SpA"
          },
          hecho_b: {
            declaracion: "El Gerente de Operaciones autorizó textualmente los 25 días suplementarios sin penalidades por retención en aduana.",
            fuente: "WhatsApp_Chat_Rodrigo_Valentina_Abril.png (12/04/2024 11:45)",
            autor_o_parte: "Rodrigo Morales"
          },
          explicacion_discrepancia: "Mientras la carta formal notarial sostiene que no existió comunicación ni justificación para la extensión temporal, los registros del chat institucional demuestran que el comitente convalidó la causa fortuita (paro aduanero) y amplió el cronograma.",
          impacto_procesal: "Destruye la alegación de dolo o culpa en la tardanza, frustrando el cobro indemnizatorio de la cláusula penal de $15,000 USD por vía ejecutiva u ordinaria.",
          nivel_gravedad: "Crítica"
        },
        {
          id: "C-002",
          titulo: "Exigencia de Adicionales vs. Requisito Contractual de Orden Escrita Previa",
          hecho_a: {
            declaracion: "Se exigen $8,200 USD por refuerzos de vigas ejecutados de buena fe sin aprobación formal previa.",
            fuente: "Email_Reclamo_Adicionales_Junio.txt (05/06/2024)",
            autor_o_parte: "Valentina Silva (Constructora Delta)"
          },
          hecho_b: {
            declaracion: "Todo trabajo adicional requiere orden escrita firmada por la supervisión con carácter previo a su ejecución.",
            fuente: "Contrato_Marco_Remodelacion_2024.pdf (Cláusula Novena)",
            autor_o_parte: "Ambas partes firmantes"
          },
          explicacion_discrepancia: "La contratista reclama judicialmente cobro de obras extraordinarias omitiendo el procedimiento previo de orden de cambio firmado.",
          impacto_procesal: "La contraparte opondrá excepción de contrato no cumplido frente a la partida de $8,200 USD a menos que se acredite enriquecimiento sin causa.",
          nivel_gravedad: "Moderada"
        }
      ],
      vacios_probatorios: [
        {
          id: "V-001",
          descripcion: "Falta de constancia documental del estado físico de las obras entre el 15 de mayo y el 28 de agosto de 2024",
          hecho_o_periodo_afectado: "Periodo Mayo - Agosto 2024",
          riesgo_procesal: "Imposibilidad de cuantificar con certeza ante el juez qué porcentaje real quedó ejecutado al momento del cese.",
          diligencia_o_prueba_sugerida: "Solicitar inspección judicial inmediata y requerir el libro de obras digital y bitácora del personal de recepción del edificio.",
          prioridad: "Alta"
        },
        {
          id: "V-002",
          descripcion: "Ausencia de certificación pericial informática de las conversaciones de WhatsApp",
          hecho_o_periodo_afectado: "Mensajes del 12 de Abril de 2024",
          riesgo_procesal: "Riesgo de que la contraparte alegue manipulación fotográfica o descarte las capturas de pantalla como prueba preconstituida carente de cadena de custodia.",
          diligencia_o_prueba_sugerida: "Protocolización notarial mediante cotejo del terminal físico o peritaje informático con extracción de hash SHA-256.",
          prioridad: "Alta"
        }
      ],
      red_bayesiana: {
        hipotesis: {
          id: "H-DISPUTA",
          descripcion: "Constructora Delta incurrió en abandono doloso/culpable y procede la cláusula penal de $15,000 USD",
          estado_positivo: "Abandono Culpable / Cláusula Penal Procedente",
          estado_negativo: "Prórroga Consentida / Fuerza Mayor (Sin Penalidad)",
          probabilidad_a_priori: 0.50,
          fundamentacion_previa: "Punto de partida neutral (50%) garantizando la carga probatoria equitativa entre comitente y contratista."
        },
        evidencias: [
          {
            id: "E-001",
            nombre: "Autorización de Prórroga en WhatsApp por Gerente de Operaciones",
            descripcion: "Mensaje del 12/04/2024 de Rodrigo Morales autorizando 25 días adicionales por fuerza mayor aduanera.",
            fuente_documental: "WhatsApp_Chat_Rodrigo_Valentina_Abril.png",
            cita_clave: "'No hay problema con los 25 días adicionales considerando que es fuerza mayor por la aduana.'",
            probabilidad_si_hipotesis_cierta: 0.05,
            probabilidad_si_hipotesis_falsa: 0.92,
            justificacion_probabilistica: "Es sumamente improbable (5%) que existiera abandono culposo cuando el propio comitente consintió formalmente la extensión del plazo en el chat.",
            estado_observado: "presente",
            nivel_autenticidad: 0.85,
            motivo_impugnacion: "Captura de pantalla de chat susceptible de tacha por falta de cotejo pericial del teléfono físico."
          },
          {
            id: "E-002",
            nombre: "Carta Notarial Resolutoria imputando abandono sin aviso",
            descripcion: "Requerimiento notarial del 28/08/2024 declarando resolución unilateral y exigencia de penalidad de $15,000 USD.",
            fuente_documental: "Carta_Notarial_Resolucion_Agosto.pdf",
            cita_clave: "'...verificándose un abandono doloso e injustificado de las obras a partir del 15 de mayo de 2024 sin que mediara aviso ni justificación alguna...'",
            probabilidad_si_hipotesis_cierta: 0.90,
            probabilidad_si_hipotesis_falsa: 0.20,
            justificacion_probabilistica: "Típica manifestación formal del comitente al imputar incumplimiento, aunque contradicha por sus propios actos precedentes.",
            estado_observado: "presente",
            nivel_autenticidad: 1.0,
            motivo_impugnacion: "Instrumento público notarial indubitado con firma de ministro de fe."
          },
          {
            id: "E-003",
            nombre: "Contrato Marco con fijación estricta de 120 días y cláusula penal",
            descripcion: "Contrato firmado del 15/01/2024 estipulando penalidad compensatoria no acumulable de $15,000 USD.",
            fuente_documental: "Contrato_Marco_Remodelacion_2024.pdf",
            cita_clave: "'En caso de mora culpable o abandono injustificado de faena, se fija una cláusula penal compensatoria no acumulable de $15,000 USD.'",
            probabilidad_si_hipotesis_cierta: 0.80,
            probabilidad_si_hipotesis_falsa: 0.50,
            justificacion_probabilistica: "Fija el marco obligacional y la sanción si se acreditara la culpabilidad.",
            estado_observado: "presente",
            nivel_autenticidad: 1.0,
            motivo_impugnacion: "Contrato privado con firmas autorizadas indubitadas."
          },
          {
            id: "E-004",
            nombre: "Reclamo de Obras Adicionales de Refuerzo Estructural ($8,200 USD)",
            descripcion: "Correo del 05/06/2024 comunicando refuerzo de vigas por grietas preexistentes y suspensión condicionada al pago.",
            fuente_documental: "Email_Reclamo_Adicionales_Junio.txt",
            cita_clave: "'...tuvimos que reforzar las vigas de soporte de la sala de servidores debido a grietas preexistentes en su losa...'",
            probabilidad_si_hipotesis_cierta: 0.25,
            probabilidad_si_hipotesis_falsa: 0.80,
            justificacion_probabilistica: "Acredita que la paralización no fue intempestiva ni furtiva sino originada en un diferendo por costos imprevistos de seguridad estructural.",
            estado_observado: "presente",
            nivel_autenticidad: 0.90,
            motivo_impugnacion: "Correo electrónico corporativo con cabeceras SMTP coincidentes."
          }
        ],
        tesis_probatoria: "La prueba documental electrónica desvirtúa la hipótesis de abandono intempestivo al existir autorización expresa de prórroga por actos propios del acreedor."
      },
      recomendaciones_legales: [
        "Aportar la conversación de WhatsApp como principio de prueba por escrito para oponerse a la ejecución de la cláusula penal.",
        "Solicitar con carácter de medida prejudicial preparatoria la exhibición de las cámaras de seguridad del inmueble para refutar el abandono en mayo de 2024.",
        "Reclamar reconvencionalmente la liquidación de las obras efectivamente recepcionadas invocando la doctrina de los actos propios (venire contra factum proprium) respecto de la prórroga consentida."
      ],
      metadata_analisis: {
        total_documentos: 4,
        calidad_evidencia: "Sólida con Trazabilidad Cruzada",
        alerta_integridad: "Se recomienda peritaje forense digital sobre el teléfono móvil para asegurar autenticidad del chat frente a eventuales tachas."
      },
      cadena_custodia: [
        {
          id: "CC-01",
          nombre_archivo: "Contrato_Marco_Remodelacion_2024.pdf",
          tipo: "application/pdf",
          tamano_bytes: 142000,
          sha256: "4a8f1e29c0d38b5719e7a2b0c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2",
          fecha_fijacion: "2024-08-29T10:00:00Z",
          algoritmo: "SHA-256 (FIPS-180-4)",
          estado_integridad: "Intacto / Verificado",
          hechos_relacionados: ["H-001"],
          evidencias_relacionadas: ["E-003"],
          observaciones_forenses: "Copia digital certificada sin discrepancias de hash."
        },
        {
          id: "CC-02",
          nombre_archivo: "WhatsApp_Chat_Rodrigo_Valentina_Abril.png",
          tipo: "image/png",
          tamano_bytes: 45000,
          sha256: "c83f91a2b4e5d6c708192a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d",
          fecha_fijacion: "2024-08-29T10:05:00Z",
          algoritmo: "SHA-256 (FIPS-180-4)",
          estado_integridad: "Intacto / Verificado",
          hechos_relacionados: ["H-002", "H-003"],
          evidencias_relacionadas: ["E-001"],
          observaciones_forenses: "Captura de pantalla fijada. Se recomienda cotejo de metadatos EXIF."
        },
        {
          id: "CC-03",
          nombre_archivo: "Carta_Notarial_Resolucion_Agosto.pdf",
          tipo: "application/pdf",
          tamano_bytes: 98000,
          sha256: "e19a4b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a",
          fecha_fijacion: "2024-08-29T10:10:00Z",
          algoritmo: "SHA-256 (FIPS-180-4)",
          estado_integridad: "Intacto / Verificado",
          hechos_relacionados: ["H-005"],
          evidencias_relacionadas: ["E-002"],
          observaciones_forenses: "Testimonio notarial escaneado con sello timbrado."
        },
        {
          id: "CC-04",
          nombre_archivo: "Email_Reclamo_Adicionales_Junio.txt",
          tipo: "text/plain",
          tamano_bytes: 28000,
          sha256: "8f7e6d5c4b3a2019e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2019e8d7c6b5a4f",
          fecha_fijacion: "2024-08-29T10:15:00Z",
          algoritmo: "SHA-256 (FIPS-180-4)",
          estado_integridad: "Intacto / Verificado",
          hechos_relacionados: ["H-004"],
          evidencias_relacionadas: ["E-004"],
          observaciones_forenses: "Exportación de correo con preservación de cabeceras RFC 5322."
        }
      ]
    }
  },
  {
    id: "caso-laboral",
    title: "Reclamación Laboral: Horas Extra y Despido Represalia",
    category: "Derecho Laboral",
    description: "Capturas de WhatsApp de asignación de turnos en fin de semana, correos de felicitación por productividad y posterior carta de despido por 'bajo rendimiento'.",
    suggestedContext: "Trabajador despedido por causal de bajo rendimiento e incumplimiento grave tras reclamar el pago de 60 horas extraordinarias en fines de semana solicitadas directamente por el supervisor vía WhatsApp.",
    files: [
      {
        id: "lab-1",
        name: "WhatsApp_Supervisor_Turnos_FinDeSemana.png",
        type: "text/plain",
        size: 32000,
        sha256: "9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",
        textContent: `[CHAT WHATSAPP - SUPERVISOR ÁREA LOGÍSTICA]
[06/07/2024 19:40] Supervisor Carlos Gómez: Esteban, necesitamos que vengas mañana sábado de 8am a 6pm y el domingo de 9am a 3pm para terminar el inventario trimestral. Es obligatorio, no te preocupes que esas horas van anotadas aparte con bono.
[06/07/2024 19:42] Esteban Ríos: Enterado don Carlos, ahí estaré ambos días para no dejar tirado el equipo.
[07/07/2024 18:05] Supervisor Carlos Gómez: Excelente trabajo hoy sacando los despachos pendientes, quedaron al 100%.`,
        category: "chat"
      },
      {
        id: "lab-2",
        name: "Carta_Despido_Bajo_Rendimiento.pdf",
        type: "application/pdf",
        size: 85000,
        sha256: "3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c",
        textContent: `CARTA DE DESPIDO POR CAUSAL DE INCUMPLIMIENTO CONTRACTUAL Y FALTA DE PRODUCTIVIDAD
Fecha: 31 de julio de 2024
A: Esteban Ríos Morales
Por medio de la presente, la gerencia de Recursos Humanos le notifica su desvinculación inmediata sin indemnización por haber incurrido en falta de diligencia, bajo desempeño laboral y negativa a colaborar con las metas operativas de la empresa durante el mes de julio de 2024.`,
        category: "contract"
      }
    ],
    precomputedResult: {
      resumen_caso: {
        titulo_caso: "Reclamación de Horas Extraordinarias y Nulidad de Despido Represivo: Ríos vs. Logística Express",
        resumen_ejecutivo: "El cotejo de las órdenes emitidas por mensajería instantánea frente a la carta de despido formal revela una contradicción patente. Mientras la empresa alega despido sin indemnización por 'bajo rendimiento y falta de colaboración', los registros directos del supervisor acreditan trabajo en fines de semana bajo instrucción perentoria y felicitaciones explícitas por eficiencia en el mismo mes del cese.",
        periodo_temporal: {
          inicio: "06 de Julio de 2024",
          fin: "31 de Julio de 2024"
        },
        partes_identificadas: [
          {
            nombre: "Esteban Ríos Morales",
            rol: "Trabajador / Demandante",
            detalles: "Operador logístico de bodega."
          },
          {
            nombre: "Carlos Gómez",
            rol: "Supervisor Directo",
            detalles: "Jefatura operativa de Logística Express S.A."
          }
        ]
      },
      cronologia: [
        {
          id: "H-101",
          fecha_hora: "2024-07-06 19:40",
          hecho: "El supervisor instruye al trabajador a presentarse con carácter de obligatoriedad a laborar sábado y domingo.",
          personas_involucradas: ["Carlos Gómez", "Esteban Ríos"],
          fuente_documental: "WhatsApp_Supervisor_Turnos_FinDeSemana.png",
          cita_o_referencia: "'...necesitamos que vengas mañana sábado de 8am a 6pm y el domingo de 9am a 3pm... esas horas van anotadas aparte con bono'",
          relevancia: "Alta",
          tipo_evento: "Instrucción de Turno Extraordinario",
          analisis_procesal: "Demuestra la imposición de jornada extraordinaria y el reconocimiento tácito de un registro informal fuera de la tarjeta horaria oficial."
        },
        {
          id: "H-102",
          fecha_hora: "2024-07-07 18:05",
          hecho: "El supervisor felicita al trabajador por la conclusión exitosa de los despachos pendientes en día festivo.",
          personas_involucradas: ["Carlos Gómez", "Esteban Ríos"],
          fuente_documental: "WhatsApp_Supervisor_Turnos_FinDeSemana.png",
          cita_o_referencia: "'Excelente trabajo hoy sacando los despachos pendientes, quedaron al 100%.'",
          relevancia: "Alta",
          tipo_evento: "Evaluación de Desempeño Favorable",
          analisis_procesal: "Prueba contemporánea directa que refuta radicalmente la imputación de 'bajo rendimiento' formalizada 24 días después."
        },
        {
          id: "H-103",
          fecha_hora: "2024-07-31 09:00",
          hecho: "Notificación de carta de despido disciplinario sin derecho a indemnización aduciendo falta de diligencia y negativa a colaborar.",
          personas_involucradas: ["Recursos Humanos Logística Express", "Esteban Ríos"],
          fuente_documental: "Carta_Despido_Bajo_Rendimiento.pdf",
          cita_o_referencia: "'...por haber incurrido en falta de diligencia, bajo desempeño laboral y negativa a colaborar con las metas operativas...'",
          relevancia: "Alta",
          tipo_evento: "Despido Disciplinario",
          analisis_procesal: "Configura presunción de despido fraudulento, injustificado y con vulneración de derechos fundamentales (garantía de indemnidad)."
        }
      ],
      contradicciones: [
        {
          id: "C-101",
          titulo: "Felicitación por Productividad vs. Causal de Despido por 'Bajo Desempeño'",
          hecho_a: {
            declaracion: "El trabajador incurrió en negligencia, bajo rendimiento y negativa a colaborar durante julio de 2024.",
            fuente: "Carta_Despido_Bajo_Rendimiento.pdf (31/07/2024)",
            autor_o_parte: "Recursos Humanos"
          },
          hecho_b: {
            declaracion: "El supervisor directo calificó el trabajo como 'excelente' y al '100%' tras laborar en fin de semana fuera de su jornada ordinaria.",
            fuente: "WhatsApp_Supervisor_Turnos_FinDeSemana.png (07/07/2024)",
            autor_o_parte: "Carlos Gómez (Supervisor)"
          },
          explicacion_discrepancia: "La empresa imputa falta de rendimiento en el mismo periodo en que la jefatura directa dejó constancia escrita de desempeño sobresaliente y disponibilidad voluntaria en días de descanso.",
          impacto_procesal: "Evidencia palmaria de causal simulada o fraudulenta, habilitando demanda laboral por despido injustificado y recargo legal del 30% al 80%.",
          nivel_gravedad: "Crítica"
        }
      ],
      vacios_probatorios: [
        {
          id: "V-101",
          descripcion: "Ausencia de los registros biométricos del reloj control o libro de asistencia de los días 7 y 8 de julio",
          hecho_o_periodo_afectado: "Fin de semana 6 y 7 de Julio de 2024",
          riesgo_procesal: "La empresa podría alegar que el chat fue meramente preliminar y que el trabajador no acudió efectivamente al recinto de trabajo.",
          diligencia_o_prueba_sugerida: "Solicitar inspección del trabajo u oficio a la empresa para que exhiba el registro de marcas del software de control de acceso y las bitácoras de los guardias.",
          prioridad: "Alta"
        }
      ],
      red_bayesiana: {
        hipotesis: {
          id: "H-LABORAL",
          descripcion: "El despido de Esteban Ríos fue fraudulento y en represalia tras laborar horas extraordinarias no remuneradas",
          estado_positivo: "Despido Injustificado / Causal Simulada en Represalia",
          estado_negativo: "Despido Justificado por Bajo Rendimiento Real",
          probabilidad_a_priori: 0.50,
          fundamentacion_previa: "Presunción de indemnidad laboral y distribución de la carga de probar el incumplimiento grave sobre el empleador."
        },
        evidencias: [
          {
            id: "E-101",
            nombre: "Instrucción de Turno Extraordinario Obligatorio en Fin de Semana con Promesa de Bono",
            descripcion: "Mensaje de WhatsApp del 06/07/2024 donde el supervisor ordena acudir en sábado y domingo prometiendo pago fuera de nómina.",
            fuente_documental: "WhatsApp_Supervisor_Turnos_FinDeSemana.png",
            cita_clave: "'Esteban, necesitamos que vengas mañana sábado de 8am a 6pm y el domingo de 9am a 3pm... esas horas van anotadas aparte con bono.'",
            probabilidad_si_hipotesis_cierta: 0.95,
            probabilidad_si_hipotesis_falsa: 0.10,
            justificacion_probabilistica: "Muy alta probabilidad (95%) de despido fraudulento al demostrarse imposición de jornada ilegal fuera de registro.",
            estado_observado: "presente",
            nivel_autenticidad: 0.80,
            motivo_impugnacion: "Captura de chat personal de WhatsApp susceptible de requerir cotejo pericial del teléfono físico."
          },
          {
            id: "E-102",
            nombre: "Reconocimiento Expreso de Rendimiento Sobresaliente al Término del Turno",
            descripcion: "Mensaje de felicitación del 07/07/2024 calificando el trabajo como 'excelente' y al '100%'.",
            fuente_documental: "WhatsApp_Supervisor_Turnos_FinDeSemana.png",
            cita_clave: "'Quedó excelente el inventario, sacamos el 100%. Buen trabajo.'",
            probabilidad_si_hipotesis_cierta: 0.90,
            probabilidad_si_hipotesis_falsa: 0.05,
            justificacion_probabilistica: "Virtualmente incompatible (5%) con una causal coetánea y verídica de bajo rendimiento técnico.",
            estado_observado: "presente",
            nivel_autenticidad: 0.85,
            motivo_impugnacion: "Conversación de chat indiciaria respaldada por hechos materiales (despachos efectivamente efectuados)."
          },
          {
            id: "E-103",
            nombre: "Carta de Despido Invocando 'Bajo Rendimiento y Negativa a Colaborar'",
            descripcion: "Comunicación de Recursos Humanos del 31/07/2024 invocando causal subjetiva sin antecedentes disciplinarios previos.",
            fuente_documental: "Carta_Despido_Bajo_Rendimiento.pdf",
            cita_clave: "'...constatándose negligencia reiterada, bajo rendimiento y negativa injustificada a colaborar...'",
            probabilidad_si_hipotesis_cierta: 0.92,
            probabilidad_si_hipotesis_falsa: 0.70,
            justificacion_probabilistica: "Instrumento formal de materialización de la represalia empresarial.",
            estado_observado: "presente",
            nivel_autenticidad: 1.0,
            motivo_impugnacion: "Documento oficial emanado del empleador con fecha cierta de recepción."
          }
        ],
        tesis_probatoria: "La contradicción directa entre los elogios contemporáneos del supervisor directo y la carta posterior de despido evidencia simulación de causal con altísima certeza estadística."
      },
      recomendaciones_legales: [
        "Presentar reclamo ante la Inspección del Trabajo aportando de inmediato la transcripción certificada del chat.",
        "Solicitar la aplicación de la sanción de nulidad de despido o indemnización agravada por tutela de derechos fundamentales si el despido se produjo luego de exigir el pago del bono prometido.",
        "Asegurar la declaración testimonial del supervisor bajo apercibimiento legal."
      ],
      metadata_analisis: {
        total_documentos: 2,
        calidad_evidencia: "Sólida",
        alerta_integridad: "Verificar correlación horaria de las conexiones telefónicas para respaldar geolocalización en la bodega."
      },
      cadena_custodia: [
        {
          id: "CC-101",
          nombre_archivo: "WhatsApp_Supervisor_Turnos_FinDeSemana.png",
          tipo: "image/png",
          tamano_bytes: 32000,
          sha256: "9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",
          fecha_fijacion: "2024-08-01T14:20:00Z",
          algoritmo: "SHA-256 (FIPS-180-4)",
          estado_integridad: "Intacto / Verificado",
          hechos_relacionados: ["H-101", "H-102"],
          evidencias_relacionadas: ["E-101", "E-102"],
          observaciones_forenses: "Captura digital fijada. Se recomienda acta notarial de cotejo del teléfono receptor."
        },
        {
          id: "CC-102",
          nombre_archivo: "Carta_Despido_Bajo_Rendimiento.pdf",
          tipo: "application/pdf",
          tamano_bytes: 85000,
          sha256: "3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c",
          fecha_fijacion: "2024-08-01T14:25:00Z",
          algoritmo: "SHA-256 (FIPS-180-4)",
          estado_integridad: "Intacto / Verificado",
          hechos_relacionados: ["H-103"],
          evidencias_relacionadas: ["E-103"],
          observaciones_forenses: "Carta de despido original entregada al trabajador. Integridad de hash conforme."
        }
      ]
    }
  }
];
