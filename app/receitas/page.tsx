import { TransactionPage } from "@/components/transaction-page";
import { Suspense } from "react";

export default function ReceitasPage() {
  return <Suspense><TransactionPage type="income" /></Suspense>;
}