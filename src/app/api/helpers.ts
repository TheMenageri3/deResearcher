import { NextResponse } from "next/server";
import bs58 from "bs58";
import solanaCrypto from "tweetnacl";
import { PublicKey } from "@solana/web3.js";
import { minimizePubkey } from "@/lib/helpers";

export const toErrResponse = (err: string): NextResponse => {
  return NextResponse.json(
    {
      error: err,
    },
    {
      status: 400,
    }
  );
};

export const toSuccessResponse = <T>(data: T): NextResponse => {
  return NextResponse.json(data, {
    status: 200,
  });
};

export function verifySignature(signature: string, pubkey: string) {
  return solanaCrypto.sign.detached.verify(
    getEncodedLoginMessage(pubkey),
    bs58.decode(signature),
    bs58.decode(pubkey)
  );
}

export function getEncodedLoginMessage(pubkey: string) {
  return new Uint8Array(
    JSON.stringify({
      auth: LOGIN_MESSAGE,
      pubkey: minimizePubkey(pubkey),
    })
      .split("")
      .map((c) => c.charCodeAt(0))
  );
}

export const LOGIN_MESSAGE = "Login to deresearcher";
