"use client";

import { useEffect, useState } from "react";
import { useWizard } from "@/lib/calculadora-nova/wizard-context";
import type { ProdutoId } from "@/lib/calculadora-nova/types";

// Placeholder — troque depois pelas fotos reais de cada peça.
// Sugestão: coloque em public/calculadora-nova/stories/<produto>/ e use
// ["/calculadora-nova/stories/malha-pv/1.jpg", ...] em cada produto.
const STORIES_POR_PRODUTO: Record<ProdutoId, string[]> = {
  "malha-pv": [
    "https://picsum.photos/seed/malhapv-1/700/1100",
    "https://picsum.photos/seed/malhapv-2/700/1100",
    "https://picsum.photos/seed/malhapv-3/700/1100",
  ],
  "dry-fit-elastano": [
    "https://picsum.photos/seed/dryfit-1/700/1100",
    "https://picsum.photos/seed/dryfit-2/700/1100",
    "https://picsum.photos/seed/dryfit-3/700/1100",
  ],
  "dryfit-sublimacao-total": [
    "https://picsum.photos/seed/subli-1/700/1100",
    "https://picsum.photos/seed/subli-2/700/1100",
    "https://picsum.photos/seed/subli-3/700/1100",
  ],
  "algodao-30-1": [
    "https://picsum.photos/seed/algodao-1/700/1100",
    "https://picsum.photos/seed/algodao-2/700/1100",
    "https://picsum.photos/seed/algodao-3/700/1100",
  ],
  "egipcio-elastano": [
    "https://picsum.photos/seed/egipcio-1/700/1100",
    "https://picsum.photos/seed/egipcio-2/700/1100",
    "https://picsum.photos/seed/egipcio-3/700/1100",
  ],
  "polo-piquet": [
    "https://picsum.photos/seed/polo-1/700/1100",
    "https://picsum.photos/seed/polo-2/700/1100",
    "https://picsum.photos/seed/polo-3/700/1100",
  ],
  "calca-brim": [
    "https://picsum.photos/seed/brim-1/700/1100",
    "https://picsum.photos/seed/brim-2/700/1100",
    "https://picsum.photos/seed/brim-3/700/1100",
  ],
  "calca-jeans": [
    "https://picsum.photos/seed/jeans-1/700/1100",
    "https://picsum.photos/seed/jeans-2/700/1100",
    "https://picsum.photos/seed/jeans-3/700/1100",
  ],
};

const DURACAO = 4500;

export default function StoriesPecas() {
  const { state } = useWizard();
  const pid = state.produtoId;
  const imgs =
    (pid && STORIES_POR_PRODUTO[pid]) ??
    STORIES_POR_PRODUTO["malha-pv"];

  const [i, setI] = useState(0);

  // troca de produto reinicia o slide
  useEffect(() => {
    setI(0);
  }, [pid]);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % imgs.length), DURACAO);
    return () => clearInterval(t);
  }, [pid, imgs.length]);

  const prev = () => setI((v) => (v - 1 + imgs.length) % imgs.length);
  const next = () => setI((v) => (v + 1) % imgs.length);

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

      {imgs.map((src, idx) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${pid}-${idx}`}
          src={src}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
          style={{ opacity: idx === i ? 1 : 0 }}
        />
      ))}

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 26%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.55) 100%)",
        }}
      />

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

      <div className="absolute left-0 right-0 top-0 z-30 flex gap-1.5 p-3">
        {imgs.map((_, idx) => (
          <div
            key={idx}
            className="h-1 flex-1 overflow-hidden rounded-full bg-white/30"
          >
            <div
              key={idx === i ? `on-${pid}-${i}` : `off-${idx}`}
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
