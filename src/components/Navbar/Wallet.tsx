"use client";
import { useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  LogOut,
  Wallet as WalletIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { minimizePubkey } from "@/lib/helpers";
import useScreen from "@/hooks/useScreen";

export const Wallet = () => {
  const { setVisible } = useWalletModal();
  const { connected, publicKey, disconnect, wallet } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const screenSize = useScreen();
  const isMobile = screenSize === "sm" || screenSize === "md";

  const handleConnect = () => {
    setVisible(true);
  };

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnect();
      window.location.href = "/";
    } catch (error) {
      console.error("Error during disconnect:", error);
    }
  }, [disconnect]);

  if (!connected) {
    return (
      <Button onClick={handleConnect} className="bg-zinc-800 hover:bg-zinc-700">
        Connect Wallet
      </Button>
    );
  }

  if (isMobile) {
    return (
      <Button
        onClick={handleDisconnect}
        className="bg-zinc-800 hover:bg-zinc-700 flex items-center gap-2"
      >
        {wallet && (
          <Image
            alt={wallet.adapter.name}
            src={wallet.adapter.icon}
            width={20}
            height={20}
          />
        )}
        <span>Disconnect</span>
        <LogOut className="h-4 w-4 ml-1" />
      </Button>
    );
  }

  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button className="flex items-center gap-2">
          {wallet && (
            <Image
              alt={wallet.adapter.name}
              src={wallet.adapter.icon}
              width={20}
              height={20}
            />
          )}
          <span className="font-bold">
            {publicKey && minimizePubkey(publicKey.toBase58())}
          </span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-white" />
          ) : (
            <ChevronDown className="h-4 w-4 text-white" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" alignOffset={-5}>
        <DropdownMenuLabel>Wallet Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <WalletIcon className="mr-2 h-4 w-4" />
            <span className="truncate">{wallet?.adapter.name}</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <span className="text-xs truncate">
              {publicKey && minimizePubkey(publicKey.toBase58())}
            </span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDisconnect}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
