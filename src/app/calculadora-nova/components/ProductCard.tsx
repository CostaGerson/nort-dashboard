"use client";

import { useRef, useState } from "react";
import { formatBRL } from "@/lib/calculadora-nova/constants";
import type { Produto } from "@/lib/calculadora-nova/types";
import { ProdutoIcon } from "./ProdutoIcon";

interface Props {
  produto: Produto;
  variant: "destaque" | "padrao";
  onSelect: () => void;
}

export function ProductCard({ produto, variant, onSelect }: Props) {
  const [pulsing, setPulsing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDestaque = variant === "destaque";

  function handleClick() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPulsing(true);
    timerRef.current = setTimeout(() => {
      setPulsing(false);
      onSelect();
    }, 550);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`${produto.nome}, a partir de ${formatBRL(produto.precoBase)}`}
      style={{ boxShadow: "var(--sh-md)" }}
      className={`group relative flex w-full flex-col overflow-hidden text-left transition-all duration-300 hover:-translate-y-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--o)]/40 active:translate-y-0 cursor-pointer ${
        isDestaque
          ? "rounded-[28px] p-5 md:p-6 h-[300px]"
          : "rounded-3xl p-4 h-[212px]"
      } ${pulsing ? "animate-card-pulse" : ""}`}
    >
      {/* superfície do card */}
      <span
        aria-hidden
        className="absolute inset-0 -z-10 rounded-[inherit]"
        style={{
          background:
            "linear-gradient(180deg, #FFFFFF 0%, #FCFAF6 100%)",
          border: "1px solid var(--line)",
        }}
      />

      {/* Tag */}
      {produto.tag && (
        <span
          className="absolute top-3.5 right-3.5 z-10 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
          style={{
            background:
              produto.tag.cor === "laranja" ? "var(--o)" : "var(--navy)",
            boxShadow: "var(--sh-sm)",
          }}
        >
          {produto.tag.texto}
        </span>
      )}

      {/* Palco da ilustração */}
      <div
        className={`relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl ${
          isDestaque ? "mb-4" : "mb-3"
        }`}
        style={{
          background:
            "radial-gradient(120% 120% at 50% 18%, #FFFFFF 0%, #F1EBE1 100%)",
        }}
      >
        {/* halo quente atrás da peça */}
        <span
          aria-hidden
          className="absolute rounded-full"
          style={{
            width: isDestaque ? 168 : 116,
            height: isDestaque ? 168 : 116,
            background:
              "radial-gradient(circle, var(--o-100) 0%, rgba(255,231,220,0) 70%)",
          }}
        />
        <ProdutoIcon
          produtoId={produto.id}
          className={`relative ${isDestaque ? "h-36 w-36" : "h-24 w-24"} transition-transform duration-300 group-hover:scale-[1.04]`}
        />
      </div>

      {/* Info */}
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3
            className={`font-display font-bold leading-tight text-[var(--ink)] ${
              isDestaque ? "text-[22px]" : "text-[15px]"
            }`}
          >
            {produto.nome}
          </h3>
          <p
            className={`mt-1 ${isDestaque ? "text-[13px]" : "text-[11px]"}`}
          >
            <span className="text-[var(--muted)]">a partir de </span>
            <span className="font-display font-bold text-[var(--navy)]">
              {formatBRL(produto.precoBase)}
            </span>
          </p>
        </div>

        {isDestaque ? (
          <span
            className="flex flex-shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-[14px] font-semibold text-white transition-transform group-hover:translate-x-0.5"
            style={{ background: "var(--o)", boxShadow: "var(--sh-sm)" }}
          >
            Escolher
            <Seta />
          </span>
        ) : (
          <span
            className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full transition-transform group-hover:translate-x-0.5"
            style={{ background: "var(--o-050)", color: "var(--o)" }}
          >
            <Seta />
          </span>
        )}
      </div>

      {/* Glow do pulso */}
      {pulsing && (
        <span
          className="pointer-events-none absolute inset-0 animate-pulse-glow rounded-[inherit]"
        />
      )}

      <style jsx>{`
        @keyframes card-pulse {
          0% {
            transform: scale(1);
          }
          25% {
            transform: scale(0.96);
          }
          60% {
            transform: scale(1.02);
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-card-pulse {
          animation: card-pulse 550ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes pulse-glow {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.7);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(255, 107, 53, 0.9),
              0 0 36px 10px rgba(255, 107, 53, 0.45);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 107, 53, 0);
          }
        }
        .animate-pulse-glow {
          animation: pulse-glow 550ms ease-out;
        }
      `}</style>
    </button>
  );
}

function Seta() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
