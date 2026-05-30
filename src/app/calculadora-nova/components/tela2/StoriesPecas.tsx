"use client";

import { useEffect, useState } from "react";

// Placeholder — troque depois pelas fotos reais.
// Sugestão: coloque os arquivos em public/calculadora-nova/stories/
// e use ["/calculadora-nova/stories/1.jpg", "/calculadora-nova/stories/2.jpg", ...]
const STORIES = [
  "https://picsum.photos/seed/nort-a/700/1100",
  "https://picsum.photos/seed/nort-b/700/1100",
  "https://picsum.photos/seed/nort-c/700/1100",
  "https://picsum.photos/seed/nort-d/700/1100",
];

const DURACAO = 4500;

export default function StoriesPecas() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % STORIES.length), DURACAO);
    return () => clearInterval(t);
  }, []);

  const prev = () => setI((v) => (v - 1 + STORIES.length) % STORIES.length);
  const next = () => setI((v) => (v + 1) % STORIES.length);

  return (
    <div className="relative hidden h-full min-h-[440px] overflow-hidden rounded-[22px] bg-[var(--navy)] lg:block">
      <style jsx>{`
        @keyframes nortStoryFill {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
        .nort-story-fill {
          animation: nortStoryFill ${DURACAO}ms linear forwards;
        }
      `}</style>

      {/* imagens (crossfade) */}
      {STORIES.map((src, idx) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={idx}
          src={src}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
          style={{ opacity: idx === i ? 1 : 0 }}
        />
      ))}

      {/* scrims pra legibilidade */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 26%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* zonas de toque */}
      <button
        type="button"
        onClick={prev}
        aria-label="Imagem anterior"
        className="absolute left-0 top-0 z-20 h-full w-1/3 cursor-pointer focus:outline-none"
      />
      <button
        type="button"
        onClick={next}
        aria-label="Próxima imagem"
        className="absolute right-0 top-0 z-20 h-full w-1/3 cursor-pointer focus:outline-none"
      />

      {/* barra de progresso (stories) */}
      <div className="absolute left-0 right-0 top-0 z-30 flex gap-1.5 p-3">
        {STORIES.map((_, idx) => (
          <div
            key={idx}
            className="h-1 flex-1 overflow-hidden rounded-full bg-white/30"
          >
            <div
              key={idx === i ? `on-${i}` : `off-${idx}`}
              className={idx === i ? "nort-story-fill" : ""}
              style={{
                height: "100%",
                background: "#fff",
                width: idx < i ? "100%" : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* legenda */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 text-white">
        <div className="text-[10px] font-bold uppercase tracking-wider text-white/70">
          Modelos reais
        </div>
        <div className="font-display text-[16px] font-bold leading-tight">
          Veja como fica na pele
        </div>
      </div>
    </div>
  );
}
