"use client";

import { useRouter } from "next/navigation";
import { PRODUTOS } from "@/lib/calculadora-nova/constants";
import { useWizard } from "@/lib/calculadora-nova/wizard-context";
import { ProductCard } from "./ProductCard";

export function Tela1Produto() {
  const router = useRouter();
  const { selecionarProduto } = useWizard();

  const destaques = PRODUTOS.filter((p) => p.destaque);
  const menores = PRODUTOS.filter((p) => !p.destaque);

  return (
    <div className="nort-bg min-h-screen text-[var(--ink)]">
      {/* Header */}
      <header className="mx-auto grid h-[72px] max-w-[1280px] grid-cols-[auto_1fr_auto] items-center gap-2 px-4 md:px-8 lg:px-12">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="relative z-10 grid h-12 w-12 place-items-center rounded-full bg-white/70 text-[var(--navy)] transition-colors hover:bg-white active:scale-95 cursor-pointer"
          style={{ boxShadow: "var(--sh-sm)" }}
          aria-label="Voltar pro dashboard"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        {/* Progresso */}
        <div className="flex flex-col items-center gap-1.5 select-none">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-8 rounded-full" style={{ background: "var(--o)" }} />
            <span className="h-1.5 w-8 rounded-full" style={{ background: "var(--line)" }} />
            <span className="h-1.5 w-8 rounded-full" style={{ background: "var(--line)" }} />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            Passo 1 de 3 · Produto
          </span>
        </div>

        <span className="h-12 w-12" aria-hidden />
      </header>

      {/* Conteúdo */}
      <main className="mx-auto max-w-[1280px] px-4 py-8 md:px-8 md:py-12 lg:px-12">
        {/* Chamada */}
        <div className="mb-8 md:mb-10">
          <span className="text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--o)]">
            Nort Sports · Orçamento
          </span>
          <h1 className="font-display mt-2 text-[34px] font-extrabold leading-[1.04] text-[var(--ink)] md:text-[54px]">
            Monte seu orçamento
          </h1>
          <p className="mt-3 text-[16px] text-[var(--ink-2)] md:text-[18px]">
            Toque no produto que você quer pra começar.
          </p>
        </div>

        {/* Destaques */}
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {destaques.map((p) => (
            <ProductCard
              key={p.id}
              produto={p}
              variant="destaque"
              onSelect={() => selecionarProduto(p.id)}
            />
          ))}
        </div>

        {/* Menores */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {menores.map((p) => (
            <ProductCard
              key={p.id}
              produto={p}
              variant="padrao"
              onSelect={() => selecionarProduto(p.id)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
