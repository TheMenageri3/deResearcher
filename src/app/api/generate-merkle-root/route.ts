import { NextRequest } from "next/server";
import { toSuccessResponse } from "../helpers";
import { MerkleTree } from "merkletreejs";
import SHA256 from "crypto-js/sha256";

const MAX_MERKLE_ROOT_STRING_LENGTH = 64;

function removeHexPrefix(hex: string): string {
  if (hex.startsWith("0x")) {
    return hex.slice(2, hex.length);
  }
  return hex;
}

function generateMerkleRoot(data: Object): string {
  const objValues = Object.values(data);

  const merkelLeaves: string[] = [];

  for (let i = 0; i < objValues.length; i++) {
    const obj = objValues[i];

    // If the object is an array, hash the array and add the hash to the merkleLeaves
    if (Array.isArray(obj)) {
      const merkleLeaves = obj.map((item): string => {
        if (typeof item !== "string") {
          return item.toString();
        }
        return item;
      });
      let hashedMerkleRoot = new MerkleTree(merkleLeaves, SHA256).getHexRoot();

      hashedMerkleRoot = removeHexPrefix(hashedMerkleRoot);

      merkelLeaves.push(hashedMerkleRoot);
    }

    merkelLeaves.push(SHA256(obj.toString()).toString());
  }

  const hashedMerkleRoot = new MerkleTree(merkelLeaves, SHA256).getHexRoot();

  return hashedMerkleRoot;
}

export async function POST(req: NextRequest) {
  const data: Object = await req.json();
  const merkleRoot = removeHexPrefix(generateMerkleRoot(data));

  return toSuccessResponse({ merkleRoot });
}
