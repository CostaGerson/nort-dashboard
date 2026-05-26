"use client";

import {
  WizardProvider,
  useWizard,
} from "@/lib/calculadora-nova/wizard-context";
import { Tela1Produto } from "./components/Tela1Produto";
import { Tela2Placeholder } from "./components/Tela2Placeholder";

function WizardSwitch() {
  const { step } = useWizard();

  return (
    <div className="relative overflow-hidden">
      <div
        key={step}
        style={{
          animation: "slide-in 350ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {step === 1 && <Tela1Produto />}
        {step === 2 && <Tela2Placeholder />}
        {step === 3 && <Tela2Placeholder />}
      </div>

      <style jsx global>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
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
