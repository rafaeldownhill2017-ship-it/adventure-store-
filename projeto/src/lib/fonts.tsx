import React, { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

let pronto: Promise<void> | null = null;
const carregar = () => {
  if (!pronto) {
    pronto = Promise.all(
      [400, 600, 700, 800].map(async (peso) => {
        const arquivo = peso >= 700 ? "manrope-700.woff2" : "manrope-400.woff2";
        const f = new FontFace("Manrope", `url(${staticFile(`fonts/${arquivo}`)})`, { weight: String(peso) });
        await f.load();
        document.fonts.add(f);
      }),
    ).then(() => undefined);
  }
  return pronto;
};

/** Só renderiza o filme depois da Manrope carregada (texturas de canvas dependem dela). */
export const FontGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ok, setOk] = useState(false);
  const [handle] = useState(() => delayRender("Manrope"));
  useEffect(() => {
    carregar().then(() => {
      setOk(true);
      continueRender(handle);
    });
  }, [handle]);
  return ok ? <>{children}</> : null;
};
