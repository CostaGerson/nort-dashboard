"use client";

import { useEffect, useState } from "react";

// API global simples baseada em CustomEvent — qualquer componente faz:
// window.dispatchEvent(new CustomEvent("nort-toast", { detail: "mensagem" }))

export default function Toast() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    function onToast(e: Event) {
      const detail = (e as CustomEvent<string>).detail;
      if (!detail) return;
      setMsg(detail);
      const t = setTimeout(() => setMsg(null), 3200);
      return () => clearTimeout(t);
    }
    window.addEventListener("nort-toast", onToast);
    return () => window.removeEventListener("nort-toast", onToast);
  }, []);

  if (!msg) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#1A1A1A] px-5 py-3 text-[13px] font-medium text-white shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
    >
      {msg}
    </div>
  );
}
