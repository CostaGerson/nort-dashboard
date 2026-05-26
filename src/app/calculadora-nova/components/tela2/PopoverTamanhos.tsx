"use client";

import { useEffect, useRef } from "react";
import type {
  LocalEstampa,
  SubLocalEstampa,
  TamanhoEstampa,
  Tecnica,
} from "@/lib/calculadora-nova/types";
import { TAMANHOS_LABEL } from "@/lib/calculadora-nova/constants";
import { tamanhosPermitidos, labelPosicao } from "@/lib/calculadora-nova/posicoes";

interface Props {
  local: LocalEstampa;
  subLocal: SubLocalEstampa;
  tecnica: Tecnica;
  onEscolher: (t: TamanhoEstampa) => void;
  onFechar: () => void;
}

const TAMANHOS_TODOS: TamanhoEstampa[] = ["2x10", "8x6", "10x15", "29x21"];

export default function PopoverTamanhos({
  local,
  subLocal,
  tecnica,
  onEscolher,
  onFechar,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const permitidos = tamanhosPermitidos({ local, subLocal }, tecnica);

  // fechar com ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onFechar();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onFechar]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
      onClick={onFechar}
      role="dialog"
      aria-modal="true"
      aria-label="Escolher tamanho da estampa"
    >
      <div
        ref={ref}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9B9A95]">
              Posição
            </p>
            <h3 className="text-[18px] font-semibold text-[#1A1A1A]">
              {labelPosicao(local, subLocal)}
            </h3>
          </div>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#1A1A1A] text-white transition hover:bg-black"
          >
            <svg width="12" height="12" viewBox="0 0 12 12">
              <path d="M2 2 L10 10 M10 2 L2 10" stroke="white" strokeWidth="1.5" />
            </svg>
          </button>
        </div>

        <p className="mb-3 text-[12px] text-[#9B9A95]">Escolha o tamanho da estampa</p>

        <div className="grid grid-cols-2 gap-2">
          {TAMANHOS_TODOS.map((t) => {
            const ok = permitidos.includes(t);
            return (
              <button
                key={t}
                type="button"
                disabled={!ok}
                onClick={() => ok && onEscolher(t)}
                className={`relative rounded-2xl px-4 py-4 text-[15px] font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#FF6B35] ${
                  ok
                    ? "cursor-pointer bg-[#FF6B35] text-white hover:bg-[#e85d2a]"
                    : "cursor-not-allowed bg-[#F5F3EF] text-[#9B9A95]"
                }`}
              >
                {TAMANHOS_LABEL[t]}
                {!ok && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="block h-[1px] w-3/4 rotate-[-20deg] bg-[#9B9A95]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
