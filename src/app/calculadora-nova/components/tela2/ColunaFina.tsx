"use client";

import { useWizard } from "@/lib/calculadora-nova/wizard-context";
import {
  getProduto,
  CORES,
  CORES_POR_PRODUTO,
} from "@/lib/calculadora-nova/constants";
import type { CorId } from "@/lib/calculadora-nova/types";

export default function ColunaFina() {
  const { state, setManga, setCor, setTecnica } = useWizard();
  if (!state.produtoId) return null;

  const produto = getProduto(state.produtoId);
  const ehSublimacao = produto.id === "dryfit-sublimacao-total";
  const ehCalca = produto.tipo === "calca";
  const corTravada = produto.id === "calca-jeans";

  const mostrarManga = produto.permiteManga;
  const mostrarCor = !ehSublimacao && !corTravada;
  const mostrarTecnica = !ehSublimacao && !ehCalca;
  const podeBordar = produto.permiteBordado;

  const coresDisponiveis = CORES_POR_PRODUTO[produto.id] ?? [];

  return (
    <aside
      className="rounded-3xl bg-white p-4 lg:p-3.5"
      style={{ boxShadow: "var(--sh-md)", border: "1px solid var(--line)" }}
    >
      <div className="flex flex-row gap-5 lg:flex-col lg:gap-0 lg:divide-y lg:divide-[var(--line)]">
        {mostrarManga && (
          <Bloco titulo="Manga">
            <div className="flex flex-row gap-2 lg:flex-col">
              <PillToggle
                ativo={state.manga === "curta"}
                onClick={() => setManga("curta")}
                label="Curta"
              />
              <PillToggle
                ativo={state.manga === "longa"}
                onClick={() => setManga("longa")}
                label="Longa"
                hint={ehSublimacao ? undefined : "+R$4 a peça"}
              />
            </div>
          </Bloco>
        )}

        {mostrarCor && (
          <Bloco titulo="Cor">
            <ul className="flex flex-row flex-wrap gap-2 lg:flex-col lg:flex-nowrap lg:gap-1">
              {coresDisponiveis.map((corId) => (
                <li key={corId}>
                  <BotaoCor
                    corId={corId}
                    ativo={state.corId === corId}
                    onClick={() => setCor(corId)}
                  />
                </li>
              ))}
            </ul>
            {coresDisponiveis.includes("especial") && (
              <p className="mt-2.5 text-[11px] leading-snug text-[var(--ink-2)]">
                Quer outra cor? A gente faz{" "}
                <span className="font-semibold text-[var(--o)]">(+15%)</span>
              </p>
            )}
          </Bloco>
        )}

        {mostrarTecnica && (
          <Bloco titulo="Técnica">
            <div className="flex flex-row gap-2 lg:flex-col">
              <PillToggle
                ativo={state.tecnica === "dtf"}
                onClick={() => setTecnica("dtf")}
                label="DTF"
              />
              {podeBordar && (
                <PillToggle
                  ativo={state.tecnica === "bordado"}
                  onClick={() => setTecnica("bordado")}
                  label="Bordado"
                  hint="+R$20"
                />
              )}
            </div>
            <p className="mt-2.5 text-[12px] font-medium leading-snug text-[var(--ink)]">
              {state.tecnica === "dtf"
                ? "Estampa colorida, encaixa qualquer arte"
                : "O clássico que todo mundo conhece"}
            </p>
            <p className="mt-1 text-[11px] leading-tight text-[var(--muted)]">
              vale pra todas as estampas
            </p>
          </Bloco>
        )}
      </div>
    </aside>
  );
}

function Bloco({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 lg:py-3.5 lg:first:pt-1 lg:last:pb-1">
      <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
        {titulo}
      </p>
      {children}
    </div>
  );
}

function PillToggle({
  ativo,
  onClick,
  label,
  hint,
}: {
  ativo: boolean;
  onClick: () => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className="flex min-h-[50px] flex-1 cursor-pointer items-center justify-between gap-2 rounded-2xl px-3.5 py-2.5 text-left transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--o)]/30 active:scale-[0.98]"
      style={
        ativo
          ? { background: "var(--navy)", border: "1px solid var(--navy)" }
          : { background: "#fff", border: "1px solid var(--line)" }
      }
    >
      <span className="flex flex-col">
        <span
          className="text-[14px] font-semibold leading-tight"
          style={{ color: ativo ? "#fff" : "var(--ink)" }}
        >
          {label}
        </span>
        {hint && (
          <span
            className="mt-0.5 text-[11px] leading-tight"
            style={{ color: ativo ? "rgba(255,255,255,0.7)" : "var(--muted)" }}
          >
            {hint}
          </span>
        )}
      </span>
      {ativo && (
        <span
          className="grid h-5 w-5 flex-shrink-0 place-items-center rounded-full"
          style={{ background: "var(--o)", color: "#fff" }}
        >
          <Check />
        </span>
      )}
    </button>
  );
}

function BotaoCor({
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
      className="flex min-h-[48px] w-full cursor-pointer items-center gap-2.5 rounded-2xl px-2.5 py-2 transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--o)]/30 active:scale-[0.98]"
      style={
        ativo
          ? { background: "var(--o-050)", border: "1px solid var(--o)" }
          : { background: "#fff", border: "1px solid var(--line)" }
      }
    >
      <span className="relative flex-shrink-0">
        <span
          className="block h-9 w-9 rounded-full"
          style={{
            background: ehEspecial
              ? "conic-gradient(from 210deg, #FF6B35, #001F3F, #FF6B35)"
              : cor.hex,
            boxShadow: ativo
              ? "0 0 0 2px var(--o), inset 0 0 0 1px rgba(0,0,0,0.08)"
              : "inset 0 0 0 1px rgba(0,0,0,0.12)",
          }}
        />
        {ativo && (
          <span
            className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full"
            style={{ background: "var(--o)", color: "#fff" }}
          >
            <Check small />
          </span>
        )}
      </span>
      <span
        className="hidden text-[13px] font-medium lg:inline"
        style={{ color: ativo ? "var(--o)" : "var(--ink)" }}
      >
        {cor.nome}
      </span>
    </button>
  );
}

function Check({ small }: { small?: boolean }) {
  const s = small ? 9 : 12;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
