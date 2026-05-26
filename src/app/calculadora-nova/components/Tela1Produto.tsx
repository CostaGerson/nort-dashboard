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
    <div className="min-h-screen bg-[#F5F3EF] text-[#1A1A1A]">
      {/* Header */}
      <header className="px-4 md:px-8 lg:px-12 h-[60px] border-b border-[#E8E6E1] flex items-center">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="w-9 h-9 grid place-items-center rounded-full hover:bg-black/5 transition-colors"
          aria-label="Voltar pro dashboard"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <span className="flex-1 text-center text-xs font-medium text-[#9B9A95] -ml-9">
          passo 1 de 3 · produto
        </span>
      </header>

      {/* Conteúdo */}
      <main className="px-4 md:px-8 lg:px-12 py-8 md:py-12 max-w-[1280px] mx-auto">
        {/* Chamada */}
        <div className="mb-8 md:mb-10">
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
            Monte seu orçamento
          </h1>
          <p className="mt-2 text-base text-[#9B9A95]">
            Escolha o produto pra começar.
          </p>
        </div>

        {/* Destaques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
