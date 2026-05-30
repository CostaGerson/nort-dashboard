"use client";

import { useWizard } from "@/lib/calculadora-nova/wizard-context";
import {
  getProduto,
  CORES,
  CORES_POR_PRODUTO,
  TAMANHOS_LABEL,
  formatBRL,
} from "@/lib/calculadora-nova/constants";
import { mensagemFaixa, economiaPorPeca } from "@/lib/calculadora-nova/pricing";
import { labelPosicao } from "@/lib/calculadora-nova/posicoes";
import type { CorId } from "@/lib/calculadora-nova/types";

export default function PainelConfig() {
  const { state, setManga, setTecnica, setBolsoCalca } = useWizard();
  if (!state.produtoId) return null;

  const produto = getProduto(state.produtoId);
  const ehSubli = produto.id === "dryfit-sublimacao-total";
  const ehCalca = produto.tipo === "calca";
  const corTravada = produto.id === "calca-jeans";

  const mostrarCor = !ehSubli && !corTravada;
  const mostrarManga = produto.permiteManga;
  const mostrarTecnica = !ehSubli && !ehCalca;
  const mostrarEstampas = !ehSubli && !ehCalca;
  const podeBordar = produto.permiteBordado;

  return (
    <div className="flex h-full flex-col gap-2.5">
      {mostrarCor && (
        <Bloco titulo="Cor">
          <SwatchRow />
        </Bloco>
      )}

      <div className="flex gap-2.5">
        {mostrarManga && (
          <Bloco titulo="Manga" className="flex-1">
            <Segmented
              value={state.manga}
              onChange={(v) => setManga(v as "curta" | "longa")}
              items={[
                { value: "curta", label: "Curta" },
                { value: "longa", label: "Longa", hint: "+R$4" },
              ]}
            />
          </Bloco>
        )}

        {mostrarTecnica && (
          <Bloco titulo="Técnica" className="flex-1">
            {podeBordar ? (
              <Segmented
                value={state.tecnica}
                onChange={(v) => setTecnica(v as "dtf" | "bordado")}
                items={[
                  { value: "dtf", label: "DTF" },
                  { value: "bordado", label: "Bordado", hint: "+R$20" },
                ]}
              />
            ) : (
              <Segmented
                value="dtf"
                onChange={() => {}}
                items={[{ value: "dtf", label: "DTF" }]}
              />
            )}
          </Bloco>
        )}
      </div>

      {ehCalca && (
        <Bloco titulo="Bordar no bolso?">
          <Segmented
            value={state.bolsoCalca ? "sim" : "nao"}
            onChange={(v) => setBolsoCalca(v === "sim")}
            items={[
              { value: "sim", label: "Sim", hint: "+R$20" },
              { value: "nao", label: "Não" },
            ]}
          />
        </Bloco>
      )}

      <Bloco titulo="Quantidade">
        <QuantidadeRegua />
      </Bloco>

      {mostrarEstampas && <EstampasMin />}

      <PrecoBloco />
    </div>
  );
}

/* ---------- wrappers ---------- */

function Bloco({
  titulo,
  children,
  className = "",
}: {
  titulo: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-white p-3 ${className}`}
      style={{ border: "1px solid var(--line)", boxShadow: "var(--sh-sm)" }}
    >
      <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
        {titulo}
      </p>
      {children}
    </div>
  );
}

/* ---------- Cor ---------- */

function SwatchRow() {
  const wiz = useWizard();
  if (!wiz.state.produtoId) return null;
  const cores = CORES_POR_PRODUTO[wiz.state.produtoId] ?? [];

  return (
    <div>
      <div className="flex flex-wrap gap-x-3 gap-y-2">
        {cores.map((corId) => (
          <SwatchCor
            key={corId}
            corId={corId}
            ativo={wiz.state.corId === corId}
            onClick={() => wiz.setCor(corId)}
          />
        ))}
      </div>
      {cores.includes("especial") && (
        <p className="mt-2.5 text-[11px] leading-snug text-[var(--ink-2)]">
          Quer outra cor? A gente faz. Selecione{" "}
          <span className="font-semibold text-[var(--o)]">cor especial</span>.
        </p>
      )}
    </div>
  );
}

function SwatchCor({
  corId,
  ativo,
  onClick,
}: {
  corId: CorId;
  ativo: boolean;
  onClick: () => void;
}) {
  const cor = CORES[corId];
  const ehEspecial = corId === "especial";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Selecionar cor ${cor.nome}`}
      aria-pressed={ativo}
      className="flex cursor-pointer flex-col items-center gap-1.5 focus:outline-none"
      style={{ width: 52 }}
    >
      <span className="relative">
        <span
          className="block h-10 w-10 rounded-full transition-transform duration-200"
          style={{
            background: ehEspecial
              ? "conic-gradient(from 0deg, #FF5A5F, #FFB23E, #FFE14D, #4CD964, #34C7C7, #4A90E2, #8E6FE0, #E36AD4, #FF5A5F)"
              : cor.hex,
            boxShadow: ativo
              ? "0 0 0 2px var(--o), inset 0 0 0 1px rgba(0,0,0,0.08)"
              : "inset 0 0 0 1.5px rgba(0,0,0,0.14)",
            transform: ativo ? "scale(1.05)" : "scale(1)",
          }}
        />
        {ativo && (
          <span
            className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full text-white"
            style={{ background: "var(--o)" }}
          >
            <Check small />
          </span>
        )}
      </span>
      <span
        className="text-center text-[10px] font-medium leading-tight"
        style={{ color: ativo ? "var(--o)" : "var(--ink-2)" }}
      >
        {cor.nome}
      </span>
    </button>
  );
}

/* ---------- Segmented ---------- */

function Segmented({
  value,
  onChange,
  items,
}: {
  value: string;
  onChange: (v: string) => void;
  items: { value: string; label: string; hint?: string }[];
}) {
  return (
    <div
      className="flex gap-1 rounded-xl p-1"
      style={{ background: "#F2EEE7" }}
    >
      {items.map((it) => {
        const ativo = it.value === value;
        return (
          <button
            key={it.value}
            type="button"
            onClick={() => onChange(it.value)}
            aria-pressed={ativo}
            className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-lg px-2 py-2 text-center transition-all duration-200 active:scale-[0.97] focus:outline-none"
            style={
              ativo
                ? { background: "var(--navy)", boxShadow: "var(--sh-sm)" }
                : { background: "transparent" }
            }
          >
            <span
              className="text-[13px] font-semibold leading-tight"
              style={{ color: ativo ? "#fff" : "var(--ink-2)" }}
            >
              {it.label}
            </span>
            {it.hint && (
              <span
                className="text-[10px] leading-tight"
                style={{ color: ativo ? "rgba(255,255,255,0.7)" : "var(--muted)" }}
              >
                {it.hint}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Quantidade + régua ---------- */

function QuantidadeRegua() {
  const { state, setQuantidade } = useWizard();
  if (!state.produtoId) return null;
  const produto = getProduto(state.produtoId);
  const ehSubli = produto.id === "dryfit-sublimacao-total";
  const ehCalca = produto.tipo === "calca";

  const marcas = ehSubli
    ? [{ label: "1", q: 1 }, { label: "6", q: 6 }, { label: "11-20", q: 11 }, { label: "21+", q: 21 }]
    : [{ label: "1", q: 1 }, { label: "6", q: 6 }, { label: "11-19", q: 11 }, { label: "20+", q: 20 }];
  const n = marcas.length;
  const q = state.quantidade;
  const posMarca = (i: number) => (i / (n - 1)) * 100;

  function qToPct(qty: number): number {
    if (qty <= marcas[0].q) return 0;
    if (qty >= marcas[n - 1].q) return 100;
    for (let i = 0; i < n - 1; i++) {
      const a = marcas[i].q;
      const b = marcas[i + 1].q;
      if (qty >= a && qty <= b) {
        return posMarca(i) + ((qty - a) / (b - a)) * (posMarca(i + 1) - posMarca(i));
      }
    }
    return 100;
  }
  function pctToQ(pct: number): number {
    if (pct <= 0) return marcas[0].q;
    if (pct >= 100) return marcas[n - 1].q;
    for (let i = 0; i < n - 1; i++) {
      const p0 = posMarca(i);
      const p1 = posMarca(i + 1);
      if (pct >= p0 && pct <= p1) {
        const a = marcas[i].q;
        const b = marcas[i + 1].q;
        return Math.max(1, Math.round(a + ((pct - p0) / (p1 - p0)) * (b - a)));
      }
    }
    return marcas[n - 1].q;
  }

  const pct = qToPct(q);
  let faixaAtivaIdx = 0;
  for (let i = 0; i < n; i++) if (q >= marcas[i].q) faixaAtivaIdx = i;

  const mostrarMsg = ehSubli || ehCalca || state.estampas.length > 0;
  const econ = economiaPorPeca(state);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setQuantidade(Math.max(1, q - 1))}
            aria-label="Diminuir quantidade"
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-full text-[20px] leading-none text-[var(--ink)] transition active:scale-95"
            style={{ background: "#F2EEE7", border: "1px solid var(--line)" }}
          >
            −
          </button>
          <span className="font-display min-w-[28px] text-center text-[20px] font-bold text-[var(--ink)]">
            {q}
          </span>
          <button
            type="button"
            onClick={() => setQuantidade(q + 1)}
            aria-label="Aumentar quantidade"
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-full text-[20px] leading-none text-[var(--ink)] transition active:scale-95"
            style={{ background: "#F2EEE7", border: "1px solid var(--line)" }}
          >
            +
          </button>
        </div>
        <span className="text-[11px] text-[var(--muted)]">
          {q === 1 ? "peça" : "peças"}
        </span>
      </div>

      <div className="relative h-5">
        <div className="absolute left-0 right-0 top-1/2 h-[4px] -translate-y-1/2 rounded-full bg-[var(--line)]" />
        <div
          className="absolute left-0 top-1/2 h-[4px] -translate-y-1/2 rounded-full bg-[var(--o)] transition-all duration-150"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={0}
          max={1000}
          value={Math.round(pct * 10)}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (Number.isFinite(v)) setQuantidade(pctToQ(v / 10));
          }}
          aria-label="Ajustar quantidade"
          className="absolute left-0 right-0 top-0 h-full w-full cursor-pointer appearance-none bg-transparent focus:outline-none [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-[#FF6B35] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[#FF6B35]"
        />
      </div>

      <div className="relative mt-1 h-4 text-[11px] text-[var(--muted)]">
        {marcas.map((m, i) => (
          <button
            key={m.label}
            type="button"
            onClick={() => setQuantidade(m.q)}
            style={{
              left: `${posMarca(i)}%`,
              transform:
                i === 0 ? "translateX(0)" : i === n - 1 ? "translateX(-100%)" : "translateX(-50%)",
            }}
            className={`absolute top-0 cursor-pointer whitespace-nowrap transition hover:text-[var(--o)] ${
              i === faixaAtivaIdx ? "font-bold text-[var(--o)]" : ""
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mostrarMsg && (
        <div className="mt-3">
          {econ > 0 ? (
            <p className="text-[12px] font-semibold text-[var(--o)]">
              Boa! Caiu {formatBRL(econ)} por peça 🎉
            </p>
          ) : (
            <p className="text-[12px] text-[var(--muted)]">{mensagemFaixa(state)}</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Estampas (minimalista) ---------- */

function EstampasMin() {
  const { state, removeEstampa } = useWizard();
  if (state.estampas.length === 0) {
    return (
      <p className="px-1 text-[11px] text-[var(--muted)]">
        Nenhuma estampa ainda — toque num + na peça.
      </p>
    );
  }
  return (
    <div className="flex flex-wrap gap-1.5 px-0.5">
      {state.estampas.map((e) => (
        <span
          key={e.id}
          className="inline-flex items-center gap-1.5 rounded-full py-1 pl-2.5 pr-1 text-[11px] text-[var(--ink)]"
          style={{ background: "#fff", border: "1px solid var(--line)" }}
        >
          {labelPosicao(e.local, e.subLocal)} · {TAMANHOS_LABEL[e.tamanho]}
          <button
            type="button"
            onClick={() => removeEstampa(e.local, e.subLocal)}
            aria-label={`Remover estampa em ${labelPosicao(e.local, e.subLocal)}`}
            className="grid h-4 w-4 cursor-pointer place-items-center rounded-full text-white"
            style={{ background: "var(--o)" }}
          >
            <svg width="8" height="8" viewBox="0 0 10 10">
              <path d="M1 1 L9 9 M9 1 L1 9" stroke="white" strokeWidth="1.8" />
            </svg>
          </button>
        </span>
      ))}
    </div>
  );
}

/* ---------- Preço + continuar ---------- */

function PrecoBloco() {
  const { resultado, setStep } = useWizard();
  return (
    <div
      className="mt-auto flex items-center justify-between gap-3 rounded-2xl p-3.5"
      style={{
        background: "linear-gradient(135deg, #FF6B35, #FF8A5B)",
        boxShadow: "0 8px 22px rgba(255,107,53,0.32)",
      }}
    >
      <div>
        <div className="text-[11px] text-white/85">por peça</div>
        <div className="font-display text-[26px] font-extrabold leading-none text-white">
          {formatBRL(resultado.precoPeca)}
        </div>
        <div className="mt-1 text-[12px] text-white/85">
          total {formatBRL(resultado.total)}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setStep(3)}
        className="flex cursor-pointer items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-[14px] font-bold text-[var(--navy)] transition active:scale-95 focus:outline-none"
      >
        Continuar
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

function Check({ small }: { small?: boolean }) {
  const s = small ? 9 : 12;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
