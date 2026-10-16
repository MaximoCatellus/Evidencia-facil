import React from "react";

export const metadata = {
  title: "EvidenciaFácil - Democratizador de E-Discovery",
  description: "Plataforma de E-Discovery para estructuración cronológica procesal de hechos, detección de contradicciones y vacíos probatorios a partir de capturas, documentos y contratos con IA."
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
