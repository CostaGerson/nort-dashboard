"use client";

import type { ProdutoId, CorId } from "@/lib/calculadora-nova/types";
import { CORES } from "@/lib/calculadora-nova/constants";

// SVG quadrado 400x400. Silhuetas placeholders prontos pra Gerson substituir
// por imagens reais. As coordenadas de "+" em ColunaPeca usam % do viewBox.

interface Props {
  produtoId: ProdutoId;
  corId: CorId | null;
  vista: "frente" | "costas";
}

export default function SilhuetaPeca({ produtoId, corId, vista }: Props) {
  const corHex = corId
    ? corId === "especial"
      ? "#B0B0B0"
      : CORES[corId].hex
    : "#D4D2CC";

  // claro/escuro pra contraste das linhas
  const escura = isCorEscura(corHex);
  const stroke = escura ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.15)";

  // calça vs camiseta/polo
  const ehCalca = produtoId === "calca-brim" || produtoId === "calca-jeans";

  return (
    <svg
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      className="block h-full w-full"
      aria-hidden="true"
    >
      {ehCalca ? (
        <Calca cor={corHex} stroke={stroke} />
      ) : (
        <Camiseta cor={corHex} stroke={stroke} vista={vista} produtoId={produtoId} />
      )}
    </svg>
  );
}

function isCorEscura(hex: string): boolean {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum < 0.5;
}

function Camiseta({
  cor,
  stroke,
  vista,
  produtoId,
}: {
  cor: string;
  stroke: string;
  vista: "frente" | "costas";
  produtoId: ProdutoId;
}) {
  const ehPolo = produtoId === "polo-piquet";
  const ehSubli = produtoId === "dryfit-sublimacao-total";

  return (
    <g>
      {/* corpo camiseta — silhueta básica */}
      <path
        d="
          M 110 80
          L 80 110
          L 60 170
          L 95 185
          L 95 340
          Q 95 355 110 355
          L 290 355
          Q 305 355 305 340
          L 305 185
          L 340 170
          L 320 110
          L 290 80
          L 250 95
          Q 200 115 150 95
          Z
        "
        fill={cor}
        stroke={stroke}
        strokeWidth="1.5"
      />

      {/* gola */}
      {vista === "frente" ? (
        ehPolo ? (
          // polo: gola em V com botões
          <g>
            <path
              d="M 170 80 L 200 130 L 230 80"
              fill="none"
              stroke={stroke}
              strokeWidth="1.5"
            />
            <line x1="200" y1="100" x2="200" y2="160" stroke={stroke} strokeWidth="1" />
            <circle cx="200" cy="115" r="2" fill={stroke} />
            <circle cx="200" cy="140" r="2" fill={stroke} />
          </g>
        ) : (
          // camiseta normal: gola redonda
          <path
            d="M 170 80 Q 200 105 230 80"
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
          />
        )
      ) : (
        // costas: gola mais alta
        <path
          d="M 170 80 Q 200 92 230 80"
          fill="none"
          stroke={stroke}
          strokeWidth="1.5"
        />
      )}

      {/* costuras laterais (sutil) */}
      <line x1="95" y1="185" x2="95" y2="340" stroke={stroke} strokeWidth="0.5" />
      <line x1="305" y1="185" x2="305" y2="340" stroke={stroke} strokeWidth="0.5" />

      {/* padrão de sublimação */}
      {ehSubli && <PadraoSublimacao />}
    </g>
  );
}

function PadraoSublimacao() {
  return (
    <g opacity="0.28">
      <defs>
        <pattern id="subli-pattern" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="11" cy="11" r="2" fill="#FF6B35" />
        </pattern>
        <clipPath id="camiseta-clip">
          <path
            d="
              M 110 80 L 80 110 L 60 170 L 95 185 L 95 340
              Q 95 355 110 355 L 290 355
              Q 305 355 305 340 L 305 185 L 340 170 L 320 110 L 290 80
              L 250 95 Q 200 115 150 95 Z
            "
          />
        </clipPath>
      </defs>
      <rect x="0" y="0" width="400" height="400" fill="url(#subli-pattern)" clipPath="url(#camiseta-clip)" />
    </g>
  );
}

function Calca({ cor, stroke }: { cor: string; stroke: string }) {
  return (
    <g>
      {/* cintura + pernas */}
      <path
        d="
          M 130 60
          L 270 60
          L 285 130
          L 275 360
          L 220 360
          L 210 180
          L 190 180
          L 180 360
          L 125 360
          L 115 130
          Z
        "
        fill={cor}
        stroke={stroke}
        strokeWidth="1.5"
      />
      {/* cinto */}
      <line x1="130" y1="80" x2="270" y2="80" stroke={stroke} strokeWidth="1" />
      {/* bolso direito (frente) */}
      <path
        d="M 230 90 Q 255 95 260 130"
        fill="none"
        stroke={stroke}
        strokeWidth="1"
      />
      {/* bolso esquerdo */}
      <path
        d="M 170 90 Q 145 95 140 130"
        fill="none"
        stroke={stroke}
        strokeWidth="1"
      />
    </g>
  );
}
