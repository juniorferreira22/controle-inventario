import { WalletHistory } from "@/components/wallet-history";

export default async function WalletPage({ params }: PageProps<"/carteiras/[walletId]">) {
  const { walletId } = await params;
  return <WalletHistory walletId={walletId} />;
}