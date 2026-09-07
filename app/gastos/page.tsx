import { TransactionPage } from "@/components/transaction-page";
import { Suspense } from "react";

export default function GastosPage() {
  return <Suspense><TransactionPage type="expense" /></Suspense>;
}