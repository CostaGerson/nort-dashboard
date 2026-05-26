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
    <div className="relative overflow-hidden">
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
