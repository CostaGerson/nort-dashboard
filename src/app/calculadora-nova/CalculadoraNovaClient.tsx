"use client";

import {
  WizardProvider,
  useWizard,
} from "@/lib/calculadora-nova/wizard-context";
import { Tela1Produto } from "./components/Tela1Produto";
import { Tela2Config } from "./components/Tela2Config";

function WizardSwitch() {
  const { step } = useWizard();

  return (
    <div className="nort-calc relative overflow-hidden">
      <div
        key={step}
        style={{
          animation: "slide-in 1100ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {step === 1 && <Tela1Produto />}
        {step === 2 && <Tela2Config />}
        {step === 3 && <Tela2Config />}
      </div>

      <style jsx global>{`
        @keyframes slide-in {
          0% {
            opacity: 0;
            transform: translateX(120px);
          }
          60% {
            opacity: 1;
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* ===== Tokens da calculadora (linguagem totem) ===== */
        .nort-calc {
          --o: #ff6b35;
          --o-press: #e2541f;
          --o-100: #ffe7dc;
          --o-050: #fff3ec;
          --navy: #001f3f;
          --navy-2: #08305c;
          --cream: #f7f3ed;
          --paper: #ffffff;
          --line: #ece6dd;
          --ink: #181613;
          --ink-2: #57534c;
          --muted: #8e8a82;
          --green: #15a862;
          --sh-sm: 0 1px 2px rgba(40, 28, 16, 0.05),
            0 3px 8px rgba(40, 28, 16, 0.05);
          --sh-md: 0 2px 6px rgba(40, 28, 16, 0.06),
            0 14px 30px rgba(40, 28, 16, 0.09);
          --sh-lg: 0 6px 14px rgba(40, 28, 16, 0.07),
            0 26px 56px rgba(40, 28, 16, 0.12),
            0 22px 60px rgba(255, 107, 53, 0.12);
        }

        .nort-calc .font-display {
          font-family: var(--font-display), "Inter", system-ui, sans-serif;
          letter-spacing: -0.02em;
        }

        .nort-bg {
          background: radial-gradient(
              1100px 520px at 18% -8%,
              #ffefe6 0%,
              rgba(255, 239, 230, 0) 60%
            ),
            radial-gradient(
              900px 500px at 100% 0%,
              #fff6ef 0%,
              rgba(255, 246, 239, 0) 55%
            ),
            var(--cream);
        }
      `}</style>
    </div>
  );
}

export function CalculadoraNovaClient() {
  return (
    <WizardProvider>
      <WizardSwitch />
    </WizardProvider>
  );
}
