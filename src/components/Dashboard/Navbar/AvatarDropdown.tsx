/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useCallback } from "react";
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
import { minimizePubkey } from "@/lib/utils/helpers";
import { Avatar } from "@/components/Avatar";

export const AvatarDropdown = () => {
  const { setVisible } = useWalletModal();
  const { connected, publicKey, disconnect, wallet } = useWallet();
  const [isOpen, setIsOpen] = useState(false);

  const handleConnect = () => {
    setVisible(true);
  };

  const handleDisconnect = useCallback(async () => {
    await disconnect();
    // Force a hard refresh of the page
    window.location.href = "/";
  }, [disconnect]);

  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 max-w-xs bg-white text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <span className="sr-only">Open user menu</span>
          <div>
            <Avatar className="h-8 w-8 rounded-full" />
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52 mr-4">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
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
