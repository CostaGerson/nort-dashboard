"use client";

import { useState } from "react";
import { formatBRL } from "@/lib/calculadora-nova/constants";
import type { Produto } from "@/lib/calculadora-nova/types";
import { ProdutoIcon } from "./ProdutoIcon";

interface Props {
  produto: Produto;
  variant: "destaque" | "padrao";
  onSelect: () => void;
}

export function ProductCard({ produto, variant, onSelect }: Props) {
  const [pressing, setPressing] = useState(false);
  const isDestaque = variant === "destaque";

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseDown={() => setPressing(true)}
      onMouseUp={() => setPressing(false)}
      onMouseLeave={() => setPressing(false)}
      aria-label={`${produto.nome}, a partir de ${formatBRL(produto.precoBase)}`}
      className={`group relative flex flex-col bg-white border border-black/[0.04] text-left transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2 ${
        isDestaque
          ? "rounded-3xl p-6 h-[280px] shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.10)]"
          : "rounded-2xl p-4 h-[180px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)]"
      } ${pressing ? "scale-[0.97]" : "scale-100"}`}
      style={{ transitionProperty: "transform, box-shadow" }}
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

      {/* Glow no clique */}
      {pressing && (
        <span
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            boxShadow: "0 0 0 2px #FF6B35, 0 0 24px rgba(255,107,53,0.35)",
          }}
        />
      )}
    </button>
  );
}
