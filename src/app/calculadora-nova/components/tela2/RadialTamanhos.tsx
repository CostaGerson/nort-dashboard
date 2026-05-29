"use client";

import { useEffect, useState } from "react";
import type {
  LocalEstampa,
  SubLocalEstampa,
  TamanhoEstampa,
  Tecnica,
} from "@/lib/calculadora-nova/types";
import { TAMANHOS_LABEL } from "@/lib/calculadora-nova/constants";
import { getPosicao, tamanhosPermitidos, labelPosicao } from "@/lib/calculadora-nova/posicoes";

interface Props {
  // ponto de origem do radial (centro do "+" clicado), em px relativos ao viewport
  origemX: number;
  origemY: number;
  local: LocalEstampa;
  subLocal: SubLocalEstampa;
  tecnica: Tecnica;
  onEscolher: (t: TamanhoEstampa) => void;
  onFechar: () => void;
}

const TAMANHOS_TODOS: TamanhoEstampa[] = ["2x10", "8x6", "10x15", "29x21"];

const TAMANHOS_DESC: Record<TamanhoEstampa, string> = {
  "2x10": "Nomes e marcas",
  "8x6": "Ótimo para logos e brasões",
  "10x15": "Estampas pequenas",
  "29x21": "Estampas grandes",
};

// 4 chips em arco: superior-esquerdo, superior-direito, inferior-esquerdo, inferior-direito
const OFFSETS = [
  { x: -75, y: -75, delay: 60 },  // 2x10  — sup esq
  { x: 75, y: -75, delay: 120 },  // 8x6   — sup dir
  { x: -75, y: 75, delay: 180 },  // 10x15 — inf esq
  { x: 75, y: 75, delay: 240 },   // 29x21 — inf dir
];

export default function RadialTamanhos({
  origemX,
  origemY,
  local,
  subLocal,
  tecnica,
  onEscolher,
  onFechar,
}: Props) {
  const [aberto, setAberto] = useState(false);
  const pos = getPosicao(local, subLocal);
  const permitidos = pos ? tamanhosPermitidos(pos, tecnica) : [];

  useEffect(() => {
    // anima abertura no próximo tick
    const t = setTimeout(() => setAberto(true), 10);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onFechar();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onFechar]);

  return (
    <div
      className="fixed inset-0 z-40"
      onClick={onFechar}
      role="dialog"
      aria-modal="true"
      aria-label={`Escolher tamanho da estampa em ${pos ? labelPosicao(local, subLocal) : ""}`}
    >
      {/* backdrop semi-transparente */}
      <div className="absolute inset-0 bg-black/30" />

      {/* container ancorado na origem */}
      <div
        className="absolute"
        style={{
          left: `${origemX}px`,
          top: `${origemY}px`,
          width: 0,
          height: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* label da posição acima do botão central */}
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#1A1A1A] px-3 py-1 text-[11px] font-semibold text-white shadow-lg transition-all duration-300"
          style={{
            top: aberto ? "-72px" : "-50px",
            opacity: aberto ? 1 : 0,
          }}
        >
          {pos ? labelPosicao(local, subLocal) : ""}
        </div>

        {/* linhas conectoras */}
        {OFFSETS.map((o, i) => {
          const tamanho = TAMANHOS_TODOS[i];
          const ok = permitidos.includes(tamanho);
          const length = Math.sqrt(o.x * o.x + o.y * o.y);
          const angle = (Math.atan2(o.y, o.x) * 180) / Math.PI;
          return (
            <div
              key={`line-${i}`}
              className="pointer-events-none absolute left-0 top-0 h-[2px] origin-left transition-all"
              style={{
                width: aberto ? `${length}px` : "0px",
                transform: `rotate(${angle}deg)`,
                background: ok
                  ? "linear-gradient(to right, rgba(255,107,53,0.6), rgba(255,107,53,0.15))"
                  : "linear-gradient(to right, rgba(155,154,149,0.5), rgba(155,154,149,0.1))",
                transitionDuration: "350ms",
                transitionDelay: `${o.delay - 30}ms`,
              }}
            />
          );
        })}

        {/* botão central — cancelar */}
        <button
          type="button"
          onClick={onFechar}
          aria-label="Cancelar"
          className="absolute -left-7 -top-7 z-10 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[#1A1A1A] text-white shadow-[0_6px_20px_rgba(0,0,0,0.35)] transition hover:bg-black active:scale-95"
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M3 3 L13 13 M13 3 L3 13" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* chips de tamanho em arco */}
        {OFFSETS.map((o, i) => {
          const tamanho = TAMANHOS_TODOS[i];
          const ok = permitidos.includes(tamanho);
          return (
            <button
              key={tamanho}
              type="button"
              disabled={!ok}
              onClick={() => ok && onEscolher(tamanho)}
              className={`absolute flex h-14 w-14 items-center justify-center rounded-full text-[12px] font-bold shadow-[0_6px_20px_rgba(0,0,0,0.25)] focus:outline-none focus:ring-2 focus:ring-[#FF6B35] ${
                ok
                  ? "cursor-pointer bg-[#FF6B35] text-white hover:scale-110 active:scale-95"
                  : "cursor-not-allowed bg-[#E8E6E1] text-[#9B9A95]"
              }`}
              style={{
                left: "-28px",
                top: "-28px",
                transform: aberto
                  ? `translate(${o.x}px, ${o.y}px) scale(1)`
                  : "translate(0px, 0px) scale(0.4)",
                opacity: aberto ? 1 : 0,
                transition: `transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1) ${o.delay}ms, opacity 200ms ease ${o.delay}ms`,
              }}
            >
              <span className="relative">
                {TAMANHOS_LABEL[tamanho]}
                {!ok && (
                  <span className="absolute inset-x-[-4px] top-1/2 block h-[1.5px] rotate-[-15deg] bg-[#9B9A95]" />
                )}
              </span>
            </button>
          );
        })}

        {/* rótulos descritivos sob cada chip */}
        {OFFSETS.map((o, i) => {
          const tamanho = TAMANHOS_TODOS[i];
          const ok = permitidos.includes(tamanho);
          return (
            <div
              key={`desc-${i}`}
              className="pointer-events-none absolute text-center"
              style={{
                left: "0px",
                top: "0px",
                width: "128px",
                marginLeft: "-64px",
                transform: `translate(${o.x}px, ${o.y + 36}px)`,
                opacity: aberto ? 1 : 0,
                transition: `opacity 200ms ease ${o.delay + 120}ms`,
              }}
            >
              <span
                className="inline-block whitespace-nowrap rounded-md px-1.5 py-0.5 text-[9px] font-medium leading-none"
                style={{
                  background: "rgba(255,255,255,0.94)",
                  color: ok ? "#1A1A1A" : "#9B9A95",
                }}
              >
                {TAMANHOS_DESC[tamanho]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
