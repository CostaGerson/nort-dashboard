"use client";

import { useWizard } from "@/lib/calculadora-nova/wizard-context";
import {
  getProduto,
  CORES,
  CORES_POR_PRODUTO,
} from "@/lib/calculadora-nova/constants";
import type { CorId, MangaTipo, Tecnica } from "@/lib/calculadora-nova/types";

export default function ColunaFina() {
  const { state, setManga, setCor, setTecnica } = useWizard();
  if (!state.produtoId) return null;

  const produto = getProduto(state.produtoId);
  const ehSublimacao = produto.id === "dryfit-sublimacao-total";
  const ehCalca = produto.tipo === "calca";
  const corTravada = produto.id === "calca-jeans";

  const mostrarManga = produto.permiteMangaLonga;
  const mostrarCor = !ehSublimacao && !corTravada;
  const mostrarTecnica = !ehSublimacao && !ehCalca; // só camiseta normal
  const podeBordar = produto.permiteBordado;

  const coresDisponiveis = CORES_POR_PRODUTO[produto.id] ?? [];

  return (
    <aside className="rounded-3xl bg-white p-4 shadow-[0_8px_32px_rgba(0,0,0,0.06)] ring-1 ring-black/5 lg:p-3">
      <div className="flex flex-row gap-4 lg:flex-col lg:gap-0 lg:divide-y lg:divide-[#E8E6E1]">
        {/* Manga */}
        {mostrarManga && (
          <Bloco titulo="Manga">
            <div className="flex flex-row gap-2 lg:flex-col">
              <PillManga ativo={state.manga === "curta"} onClick={() => setManga("curta")} label="Curta" />
              <PillManga
                ativo={state.manga === "longa"}
                onClick={() => setManga("longa")}
                label="Longa"
                hint={ehSublimacao ? undefined : "+R$4"}
              />
            </div>
          </Bloco>
        )}

        {/* Cor */}
        {mostrarCor && (
          <Bloco titulo="Cor">
            <ul className="flex flex-row gap-2 lg:flex-col lg:gap-0">
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
          </Bloco>
        )}

        {/* Técnica */}
        {mostrarTecnica && (
          <Bloco titulo="Técnica">
            <div className="flex flex-row gap-2 lg:flex-col">
              <PillTecnica
                ativo={state.tecnica === "dtf"}
                onClick={() => setTecnica("dtf")}
                label="DTF"
              />
              {podeBordar && (
                <PillTecnica
                  ativo={state.tecnica === "bordado"}
                  onClick={() => setTecnica("bordado")}
                  label="Bordado"
                />
              )}
            </div>
            <p className="mt-2 text-[10px] leading-tight text-[#9B9A95]">
              vale pra todas as estampas
            </p>
          </Bloco>
        )}
      </div>
    </aside>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="flex-1 lg:py-3 lg:first:pt-1 lg:last:pb-1">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#9B9A95]">
        {titulo}
      </p>
      {children}
    </div>
  );
}

function PillManga({
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
      className={`cursor-pointer rounded-full px-3 py-2 text-[13px] font-medium transition focus:outline-none focus:ring-2 focus:ring-[#FF6B35] ${
        ativo ? "bg-[#1A1A1A] text-white" : "bg-[#F5F3EF] text-[#1A1A1A] hover:bg-[#E8E6E1]"
      }`}
    >
      <span>{label}</span>
      {hint && (
        <span className={`ml-1 text-[10px] ${ativo ? "text-white/70" : "text-[#9B9A95]"}`}>
          {hint}
        </span>
      )}
    </button>
  );
}

function PillTecnica({
  ativo,
  onClick,
  label,
}: {
  ativo: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-full px-3 py-2 text-[13px] font-medium transition focus:outline-none focus:ring-2 focus:ring-[#FF6B35] ${
        ativo ? "bg-[#1A1A1A] text-white" : "bg-[#F5F3EF] text-[#1A1A1A] hover:bg-[#E8E6E1]"
      }`}
    >
      {label}
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
      className={`flex w-full cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 transition focus:outline-none focus:ring-2 focus:ring-[#FF6B35] ${
        ativo ? "bg-[#FFF4EE]" : "hover:bg-[#F5F3EF]"
      }`}
    >
      <span
        className={`block h-7 w-7 flex-shrink-0 rounded-full ring-1 ring-black/10 ${
          ativo ? "ring-2 ring-[#FF6B35]" : ""
        }`}
        style={{
          background: ehEspecial
            ? "linear-gradient(135deg, #FF6B35 0%, #001F3F 100%)"
            : cor.hex,
        }}
      />
      <span
        className={`hidden text-[12px] font-medium lg:inline ${
          ativo ? "text-[#FF6B35]" : "text-[#1A1A1A]"
        }`}
      >
        {cor.nome}
      </span>
    </button>
  );
}
