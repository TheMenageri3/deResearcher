"use client";

import React, { useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LogOut,
  Wallet as WalletIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { minimizePubkey } from "@/lib/helpers";
import { useUserStore } from "@/app/store/userStore";
import { useRouter } from "next/navigation";

interface WalletDropdownProps {
  simplified?: boolean;
  triggerComponent?: React.ReactNode;
  showProfileImage?: boolean;
}

export const WalletDropdown: React.FC<WalletDropdownProps> = ({
  simplified = false,
  triggerComponent,
  showProfileImage = false,
}) => {
  const router = useRouter();
  const { setVisible } = useWalletModal();
  const { connected, publicKey, disconnect, wallet } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const { logout, researcherProfile } = useUserStore();

  const handleConnect = () => {
    setVisible(true);
  };

  const handleDisconnect = useCallback(async () => {
    try {
      if (!publicKey) return;
      await disconnect();
      await logout(publicKey.toBase58());
      window.location.href = "/";
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }, [disconnect, logout, publicKey]);

  const getDropdownLabel = () => {
    if (researcherProfile !== null) {
      return (
        <>
          <div className="font-bold">{researcherProfile.name}</div>
          <div className="text-xs text-zinc-500 font-normal">
            {researcherProfile.state === "Approved" ? "Researcher" : ""}
          </div>
        </>
      );
    } else {
      return "My Account";
    }
  };

  if (!connected) {
    return (
      <Button onClick={handleConnect} className="bg-zinc-800 hover:bg-zinc-700">
        Connect Wallet
      </Button>
    );
  }

  if (simplified) {
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
        {triggerComponent || (
          <Button className="flex items-center gap-2 bg-white hover:bg-zinc-50">
            {wallet && (
              <Image
                alt={wallet.adapter.name}
                src={wallet.adapter.icon}
                width={20}
                height={20}
              />
            )}
            <span className="font-bold text-zinc-800">
              {publicKey && minimizePubkey(publicKey.toBase58())}
            </span>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-primary" />
            ) : (
              <ChevronDown className="h-4 w-4 text-primary" />
            )}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52 mr-4">
        <DropdownMenuLabel>{getDropdownLabel()}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <button
              onClick={() => {
                if (researcherProfile?.researcherPubkey) {
                  router.push(`/profile/${researcherProfile.researcherPubkey}`);
                }
              }}
              className="w-full text-left"
            >
              {researcherProfile !== null ? (
                <span>My Profile</span>
              ) : (
                <span>🚀 Explorer</span>
              )}
            </button>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
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
