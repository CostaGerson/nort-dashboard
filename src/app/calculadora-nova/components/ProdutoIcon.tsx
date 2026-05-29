"use client";

import type { ProdutoId } from "@/lib/calculadora-nova/types";

interface Props {
  produtoId: ProdutoId;
  className?: string;
}

/**
 * Ilustrações flat das peças. Traço cinza médio sobre fundo claro.
 * Mesmo viewBox 200x200 pra todas — escalonável.
 */
export function ProdutoIcon({ produtoId, className }: Props) {
  switch (produtoId) {
    case "malha-pv":
      return <CamisetaBasica className={className} />;
    case "algodao-30-1":
      return <CamisetaBasica className={className} />;
    case "dry-fit-elastano":
      return <CamisetaDryFit className={className} />;
    case "dryfit-sublimacao-total":
      return <CamisetaSublimacao className={className} />;
    case "egipcio-elastano":
      return <CamisetaEgipcio className={className} />;
    case "polo-piquet":
      return <CamisetaPolo className={className} />;
    case "calca-brim":
      return <Calca className={className} />;
    case "calca-jeans":
      return <CalcaJeans className={className} />;
  }
}

const STROKE = "#001F3F";
const FILL = "#FFFFFF";

function CamisetaBasica({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M 60 50 L 40 70 L 50 90 L 65 80 L 65 160 L 135 160 L 135 80 L 150 90 L 160 70 L 140 50 L 120 50 Q 120 65 100 65 Q 80 65 80 50 Z"
        fill={FILL}
        stroke={STROKE}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CamisetaDryFit({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M 60 50 L 40 70 L 50 90 L 65 80 L 65 160 L 135 160 L 135 80 L 150 90 L 160 70 L 140 50 L 120 50 Q 120 65 100 65 Q 80 65 80 50 Z"
        fill={FILL}
        stroke={STROKE}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* costuras laterais sugerindo elastano */}
      <path
        d="M 75 90 L 75 155"
        stroke={STROKE}
        strokeWidth="1"
        strokeDasharray="2 3"
        fill="none"
      />
      <path
        d="M 125 90 L 125 155"
        stroke={STROKE}
        strokeWidth="1"
        strokeDasharray="2 3"
        fill="none"
      />
    </svg>
  );
}

function CamisetaSublimacao({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="subli-pattern"
          x="0"
          y="0"
          width="14"
          height="14"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="3" cy="3" r="1.5" fill="#FF6B35" opacity="0.35" />
          <circle cx="10" cy="10" r="1" fill="#001F3F" opacity="0.25" />
        </pattern>
        <clipPath id="subli-clip">
          <path d="M 60 50 L 40 70 L 50 90 L 65 80 L 65 160 L 135 160 L 135 80 L 150 90 L 160 70 L 140 50 L 120 50 Q 120 65 100 65 Q 80 65 80 50 Z" />
        </clipPath>
      </defs>
      <path
        d="M 60 50 L 40 70 L 50 90 L 65 80 L 65 160 L 135 160 L 135 80 L 150 90 L 160 70 L 140 50 L 120 50 Q 120 65 100 65 Q 80 65 80 50 Z"
        fill={FILL}
        stroke={STROKE}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <rect
        x="40"
        y="50"
        width="120"
        height="120"
        fill="url(#subli-pattern)"
        clipPath="url(#subli-clip)"
      />
    </svg>
  );
}

function CamisetaEgipcio({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M 60 50 L 40 70 L 50 90 L 65 80 L 65 160 L 135 160 L 135 80 L 150 90 L 160 70 L 140 50 L 120 50 Q 120 65 100 65 Q 80 65 80 50 Z"
        fill={FILL}
        stroke={STROKE}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* gola um pouco mais detalhada */}
      <path
        d="M 80 50 Q 100 70 120 50"
        stroke={STROKE}
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

function CamisetaPolo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M 60 50 L 40 70 L 50 90 L 65 80 L 65 160 L 135 160 L 135 80 L 150 90 L 160 70 L 140 50 L 120 50 L 110 75 L 100 80 L 90 75 L 80 50 Z"
        fill={FILL}
        stroke={STROKE}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* abertura da polo */}
      <line
        x1="100"
        y1="80"
        x2="100"
        y2="105"
        stroke={STROKE}
        strokeWidth="1.5"
      />
      <circle cx="100" cy="92" r="1.5" fill={STROKE} />
      <circle cx="100" cy="102" r="1.5" fill={STROKE} />
    </svg>
  );
}

function Calca({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M 70 30 L 130 30 L 135 95 L 130 170 L 110 170 L 100 100 L 90 170 L 70 170 L 65 95 Z"
        fill={FILL}
        stroke={STROKE}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* cinto */}
      <line
        x1="70"
        y1="42"
        x2="130"
        y2="42"
        stroke={STROKE}
        strokeWidth="1.5"
      />
      {/* bolso */}
      <path
        d="M 78 50 L 95 50 L 92 70"
        stroke={STROKE}
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

function CalcaJeans({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M 70 30 L 130 30 L 135 95 L 130 170 L 110 170 L 100 100 L 90 170 L 70 170 L 65 95 Z"
        fill={FILL}
        stroke={STROKE}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <line
        x1="70"
        y1="42"
        x2="130"
        y2="42"
        stroke={STROKE}
        strokeWidth="1.5"
      />
      {/* costuras de jeans */}
      <line
        x1="100"
        y1="42"
        x2="100"
        y2="100"
        stroke={STROKE}
        strokeWidth="1"
        strokeDasharray="2 2"
      />
      <path
        d="M 78 50 L 95 50 L 92 70"
        stroke={STROKE}
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M 105 50 L 122 50 L 119 70"
        stroke={STROKE}
        strokeWidth="1.5"
        fill="none"
      />
      {/* botão */}
      <circle cx="100" cy="48" r="2" fill={STROKE} />
    </svg>
  );
}
