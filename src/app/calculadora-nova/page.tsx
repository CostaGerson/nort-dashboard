import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { CalculadoraNovaClient } from "./CalculadoraNovaClient";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Calculadora · Nort Sports",
  description: "Monte seu orçamento de camisas e uniformes esportivos.",
};

export default function CalculadoraNovaPage() {
  return (
    <div className={display.variable}>
      <CalculadoraNovaClient />
    </div>
  );
}
