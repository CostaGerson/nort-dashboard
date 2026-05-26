import type { Metadata } from "next";
import { CalculadoraNovaClient } from "./CalculadoraNovaClient";

export const metadata: Metadata = {
  title: "Calculadora · Nort Sports",
  description: "Monte seu orçamento de camisas e uniformes esportivos.",
};

export default function CalculadoraNovaPage() {
  return <CalculadoraNovaClient />;
}
