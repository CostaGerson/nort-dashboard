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
    // Espera o pulso completar antes de mudar de tela
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
      className={`group relative flex flex-col bg-white border border-black/[0.04] text-left transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2 cursor-pointer ${
        isDestaque
          ? "rounded-3xl p-6 h-[280px] shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.10)]"
          : "rounded-2xl p-4 h-[180px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)]"
      } ${pulsing ? "animate-card-pulse" : ""}`}
    >
      {/* Tag */}
      {produto.tag && (
        <span
          className={`absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full text-[10px] font-semibold text-white uppercase tracking-wide ${
            produto.tag.cor === "laranja"
              ? "bg-[#FF6B35]"
              : "bg-[#001F3F]"
          }`}
        >
          {produto.tag.texto}
        </span>
      )}

      {/* Ilustração */}
      <div
        className={`flex-1 flex items-center justify-center rounded-2xl bg-[#E8E6E1]/40 ${
          isDestaque ? "mb-4" : "mb-3"
        }`}
      >
        <ProdutoIcon
          produtoId={produto.id}
          className={isDestaque ? "h-32 w-32" : "h-20 w-20"}
        />
      </div>

      {/* Info */}
      <div className="flex items-end justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold text-[#1A1A1A] leading-tight ${
              isDestaque ? "text-lg" : "text-sm"
            }`}
          >
            {produto.nome}
          </h3>
          <p
            className={`text-[#9B9A95] font-medium ${
              isDestaque ? "text-sm mt-1" : "text-xs mt-0.5"
            }`}
          >
            a partir de {formatBRL(produto.precoBase)}
          </p>
        </div>

        {isDestaque && (
          <span className="flex-shrink-0 w-9 h-9 rounded-full bg-[#FF6B35] text-white grid place-items-center transition-transform group-hover:translate-x-0.5">
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
          </span>
        )}
      </div>

      {/* Glow do pulso */}
      {pulsing && (
        <span
          className={`absolute inset-0 pointer-events-none animate-pulse-glow ${
            isDestaque ? "rounded-3xl" : "rounded-2xl"
          }`}
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
            box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.7),
              0 0 0 0 rgba(255, 107, 53, 0);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(255, 107, 53, 0.9),
              0 0 32px 8px rgba(255, 107, 53, 0.45);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 107, 53, 0),
              0 0 0 0 rgba(255, 107, 53, 0);
          }
        }
        .animate-pulse-glow {
          animation: pulse-glow 550ms ease-out;
        }
      `}</style>
    </button>
  );
}
