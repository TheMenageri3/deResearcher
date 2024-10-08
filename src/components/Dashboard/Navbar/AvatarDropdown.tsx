"use client";

import React, { useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
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
import { Avatar } from "@/components/Avatar";
import { useUserStore } from "@/app/store/userStore";
import { useRouter } from "next/navigation";

export const AvatarDropdown = () => {
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
      await logout(publicKey.toBase58()); // Call the logout function from useUserStore
      window.location.href = "/"; // Redirect to home page
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

  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 max-w-xs bg-white text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <span className="sr-only">Open user menu</span>
          <div>
            <Avatar className="h-8 w-8 rounded-full" />
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-zinc-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-zinc-500" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52 mr-4">
        <DropdownMenuLabel>{getDropdownLabel()}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!connected ? (
          <DropdownMenuItem onClick={handleConnect}>
            <WalletIcon className="mr-2 h-4 w-4" />
            <span>Connect Wallet</span>
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <button
                  onClick={() => {
                    if (researcherProfile?.researcherPubkey) {
                      router.push(
                        `/profile/${researcherProfile.researcherPubkey}`,
                      );
                    }
                  }}
                  className="w-full text-left" // This ensures the button text aligns left like a normal menu item
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
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
