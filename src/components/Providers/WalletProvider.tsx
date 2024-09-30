"use client";
import { useMemo, useEffect } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import { useUserStore } from "@/app/store/userStore";

require("@solana/wallet-adapter-react-ui/styles.css");

const WalletConnection = ({ children }: { children: React.ReactNode }) => {
  const { wallet, connected } = useWallet();
  const { isAuthenticated, login, logout } = useUserStore();

  useEffect(() => {
    console.log("WalletConnection effect triggered", {
      connected,
      isAuthenticated,
    });
    if (connected && wallet) {
      const publicKey = wallet.adapter.publicKey?.toString();
      if (publicKey && !isAuthenticated) {
        console.log("Attempting login");
        login(publicKey);
      }
    } else if (!connected && isAuthenticated) {
      console.log("Attempting logout");
      logout();
    }
  }, [connected, wallet, isAuthenticated, login, logout]);

  return <>{children}</>;
};

export const WalletProviderUI = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Devnet;
  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(
    () =>
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [network],
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletConnection>{children}</WalletConnection>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
