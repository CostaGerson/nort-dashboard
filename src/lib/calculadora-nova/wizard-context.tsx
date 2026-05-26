"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CORES_POR_PRODUTO, getProduto } from "./constants";
import {
  getPosicao,
  posicaoDisponivelNaTecnica,
  tamanhosPermitidos,
} from "./posicoes";
import { calcular } from "./pricing";
import type {
  CorId,
  Estampa,
  LocalEstampa,
  MangaTipo,
  OrcamentoState,
  ProdutoId,
  ResultadoCalculo,
  SubLocalEstampa,
  TamanhoEstampa,
  Tecnica,
} from "./types";

type Step = 1 | 2 | 3;

interface WizardCtx {
  step: Step;
  setStep: (s: Step) => void;
  state: OrcamentoState;
  resultado: ResultadoCalculo;

  selecionarProduto: (id: ProdutoId) => void;
  resetar: () => void;

  setCor: (id: CorId) => void;
  setManga: (m: MangaTipo) => void;
  setTecnica: (t: Tecnica) => void;
  setQuantidade: (q: number) => void;
  setBolsoCalca: (v: boolean) => void;

  addEstampa: (
    local: LocalEstampa,
    subLocal: SubLocalEstampa,
    tamanho: TamanhoEstampa,
  ) => void;
  removeEstampa: (local: LocalEstampa, subLocal: SubLocalEstampa) => void;
  getEstampa: (
    local: LocalEstampa,
    subLocal: SubLocalEstampa,
  ) => Estampa | undefined;
}

const Ctx = createContext<WizardCtx | null>(null);

const STORAGE_KEY = "nort-calc-state-v1";

function initialState(): OrcamentoState {
  return {
    produtoId: null,
    corId: null,
    manga: "curta",
    tecnica: "dtf",
    estampas: [],
    bolsoCalca: false,
    quantidade: 1,
  };
}

export function WizardProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<Step>(1);
  const [state, setState] = useState<OrcamentoState>(initialState);

  // Restaura da sessionStorage (se mudou de aba ou refresh)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.state) setState(parsed.state);
        if (parsed.step) setStep(parsed.step);
      }
    } catch {
      // ignore
    }
  }, []);

  // Persiste em sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ state, step }),
      );
    } catch {
      // ignore
    }
  }, [state, step]);

  const selecionarProduto = useCallback((id: ProdutoId) => {
    setState((prev) => {
      const next = initialState();
      next.produtoId = id;

      const produto = getProduto(id);
      const coresOk = CORES_POR_PRODUTO[id];

      // Calça jeans: cor travada
      if (id === "calca-jeans") {
        next.corId = "indigo-blue";
      } else if (coresOk.length > 0) {
        next.corId = null; // usuário escolhe
      }

      // Camiseta com bordado disponível? técnica default é DTF mesmo
      next.tecnica = "dtf";
      next.manga = "curta";
      next.quantidade = 1;

      // Produto não permite bordado → travado em DTF
      if (!produto.permiteBordado) {
        next.tecnica = "dtf";
      }

      return next;
    });
    setStep(2);
  }, []);

  const resetar = useCallback(() => {
    setState(initialState());
    setStep(1);
  }, []);

  const setCor = useCallback((id: CorId) => {
    setState((p) => ({ ...p, corId: id }));
  }, []);

  const setManga = useCallback((m: MangaTipo) => {
    setState((p) => ({ ...p, manga: m }));
  }, []);

  const setTecnica = useCallback((t: Tecnica) => {
    setState((p) => {
      // Revalidar estampas existentes
      const estampasValidas = p.estampas.filter((e) => {
        const pos = getPosicao(e.local, e.subLocal);
        if (!pos) return false;
        if (!posicaoDisponivelNaTecnica(pos, t)) return false;
        return tamanhosPermitidos(pos, t).includes(e.tamanho);
      });
      const removidas = p.estampas.length - estampasValidas.length;
      if (typeof window !== "undefined" && removidas > 0) {
        window.dispatchEvent(
          new CustomEvent("nort-toast", {
            detail: `${removidas} estampa${removidas > 1 ? "s" : ""} removida${removidas > 1 ? "s" : ""} (não cabe${removidas > 1 ? "m" : ""} em ${t === "bordado" ? "bordado" : "DTF"}).`,
          }),
        );
      }
      return { ...p, tecnica: t, estampas: estampasValidas };
    });
  }, []);

  const setQuantidade = useCallback((q: number) => {
    setState((p) => ({ ...p, quantidade: Math.max(1, q) }));
  }, []);

  const setBolsoCalca = useCallback((v: boolean) => {
    setState((p) => ({ ...p, bolsoCalca: v }));
  }, []);

  const addEstampa = useCallback(
    (
      local: LocalEstampa,
      subLocal: SubLocalEstampa,
      tamanho: TamanhoEstampa,
    ) => {
      setState((p) => {
        // Remove duplicata por posição
        const semDup = p.estampas.filter(
          (e) => !(e.local === local && e.subLocal === subLocal),
        );
        const novaEstampa: Estampa = {
          id:
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random()}`,
          local,
          subLocal,
          tamanho,
        };
        return { ...p, estampas: [...semDup, novaEstampa] };
      });
    },
    [],
  );

  const removeEstampa = useCallback(
    (local: LocalEstampa, subLocal: SubLocalEstampa) => {
      setState((p) => ({
        ...p,
        estampas: p.estampas.filter(
          (e) => !(e.local === local && e.subLocal === subLocal),
        ),
      }));
    },
    [],
  );

  const getEstampa = useCallback(
    (local: LocalEstampa, subLocal: SubLocalEstampa) =>
      state.estampas.find(
        (e) => e.local === local && e.subLocal === subLocal,
      ),
    [state.estampas],
  );

  const resultado = useMemo(() => calcular(state), [state]);

  const value = useMemo<WizardCtx>(
    () => ({
      step,
      setStep,
      state,
      resultado,
      selecionarProduto,
      resetar,
      setCor,
      setManga,
      setTecnica,
      setQuantidade,
      setBolsoCalca,
      addEstampa,
      removeEstampa,
      getEstampa,
    }),
    [
      step,
      state,
      resultado,
      selecionarProduto,
      resetar,
      setCor,
      setManga,
      setTecnica,
      setQuantidade,
      setBolsoCalca,
      addEstampa,
      removeEstampa,
      getEstampa,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWizard(): WizardCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useWizard fora do WizardProvider");
  return v;
}
