import { WalletContextState } from "@solana/wallet-adapter-react";
import { Transaction, TransactionInstruction } from "@solana/web3.js";
import { Connection, Cluster } from "@solana/web3.js";
import * as sdk from "./index";
import * as solana from "@solana/web3.js";
import {
  RESEARCH_MINT_COLLECTION_PDA_SEED,
  RESEARCH_PAPER_PDA_SEED,
  RESEARCHER_PROFILE_PDA_SEED,
} from "../constants";

export class SDK {
  wallet: WalletContextState;
  pubkey: solana.PublicKey;
  connection: Connection;
  constructor(wallet: WalletContextState, cluster: Cluster) {
    if (!wallet.publicKey) {
      throw new Error("Wallet does not have a public key");
    }
    this.wallet = wallet;
    this.connection = new Connection(cluster, {
      commitment: "confirmed",
    });
    this.pubkey = wallet.publicKey;
  }

  async signTransaction(tx: Transaction): Promise<Transaction> {
    if (!this.wallet.signTransaction) {
      throw new Error("Wallet does not support transaction signing");
    }
    return this.wallet.signTransaction(tx);
  }

  async sendTransaction(tx: Transaction): Promise<string> {
    if (!this.wallet.sendTransaction) {
      throw new Error("Wallet does not support transaction sending");
    }
    return this.wallet.sendTransaction(tx, this.connection);
  }

  async signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
    if (!this.wallet.signAllTransactions) {
      throw new Error("Wallet does not support batch transaction signing");
    }
    return this.wallet.signAllTransactions(txs);
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    if (!this.wallet.signMessage) {
      throw new Error("Wallet does not support message signing");
    }
    return this.wallet.signMessage(message);
  }

  async confirmTransaction(signature: string) {
    await this.connection.confirmTransaction(signature, "confirmed");
  }

  async buildTxSignAndSend(instructions: TransactionInstruction[]) {
    const tx = new Transaction();

    instructions.forEach((instruction) => tx.add(instruction));

    const signedTx = await this.signTransaction(tx);

    const txId = await this.sendTransaction(signedTx);

    await this.confirmTransaction(txId);
  }

  async createResearcherProfile(data: sdk.CreateResearcherProfile) {
    try {
      const [researcherProfilePda, bump] =
        deriveResearcherProfilePdaPubkeyAndBump(this.pubkey);

      if (bump !== data.pdaBump) {
        throw new Error("PDA bump does not match");
      }

      const accounts: sdk.CreateResearcherProfileInstructionAccounts = {
        researcherAcc: this.pubkey,
        researcherProfilePdaAcc: researcherProfilePda,
        systemProgramAcc: solana.SystemProgram.programId,
      };

      const ixData: sdk.CreateResearcherProfileInstructionArgs = {
        createResearcherProfile: data,
      };

      const instruction = sdk.createCreateResearcherProfileInstruction(
        accounts,
        ixData,
        sdk.PROGRAM_ID
      );

      await this.buildTxSignAndSend([instruction]);
    } catch (e) {
      console.error(e);
    }
  }

  async createResearchPaper(data: sdk.CreateResearchePaper) {
    try {
      const [paperPda, bump] = deriveResearPaperPdaPubkeyAndBump(
        this.pubkey,
        data.paperContentHash
      );

      if (bump !== data.pdaBump) {
        throw new Error("PDA bump does not match");
      }

      const accounts: sdk.CreateResearchePaperInstructionAccounts = {
        publisherAcc: this.pubkey,
        researcherProfilePdaAcc: this.pubkey,
        paperPdaAcc: paperPda,
        systemProgramAcc: solana.SystemProgram.programId,
      };

      const ixData: sdk.CreateResearchePaperInstructionArgs = {
        createResearchePaper: data,
      };

      const instruction = sdk.createCreateResearchePaperInstruction(
        accounts,
        ixData,
        sdk.PROGRAM_ID
      );

      await this.buildTxSignAndSend([instruction]);
    } catch (e) {
      console.error(e);
    }
  }

  async addPeerReview(paperPda: solana.PublicKey, data: sdk.AddPeerReview) {
    try {
      const [peerReviewPda, bump] = derivePeerReviewPdaPubkeyAndBump(
        this.pubkey,
        paperPda
      );

      if (bump !== data.pdaBump) {
        throw new Error("PDA bump does not match");
      }

      const [researcherProfilePda, _] = deriveResearcherProfilePdaPubkeyAndBump(
        this.pubkey
      );

      const accounts: sdk.AddPeerReviewInstructionAccounts = {
        reviewerAcc: this.pubkey,
        researcherProfilePdaAcc: researcherProfilePda,
        paperPdaAcc: paperPda,
        peerReviewPdaAcc: peerReviewPda,
        systemProgramAcc: solana.SystemProgram.programId,
      };

      const ixData: sdk.AddPeerReviewInstructionArgs = {
        addPeerReview: data,
      };

      const instruction = sdk.createAddPeerReviewInstruction(
        accounts,
        ixData,
        sdk.PROGRAM_ID
      );

      await this.buildTxSignAndSend([instruction]);
    } catch (e) {
      console.error(e);
    }
  }

  async mintResearchPaper(
    paperPda: solana.PublicKey,
    data: sdk.MintResearchPaper
  ) {
    try {
      const [mintCollectionPda, bump] =
        deriveResearchMintCollectionPdaPubkeyAndBump(this.pubkey);

      if (bump !== data.pdaBump) {
        throw new Error("PDA bump does not match");
      }

      const [researcherProfilePda, researcherProfileBump] =
        deriveResearcherProfilePdaPubkeyAndBump(this.pubkey);

      const paper = await sdk.ResearchPaper.fromAccountAddress(
        this.connection,
        paperPda
      );

      const accounts: sdk.MintResearchPaperInstructionAccounts = {
        readerAcc: this.pubkey,
        paperPdaAcc: paperPda,
        researcherProfilePdaAcc: researcherProfilePda,
        researchMintCollectionPdaAcc: mintCollectionPda,
        feeReceiverAcc: paper.creatorPubkey,
        systemProgramAcc: solana.SystemProgram.programId,
      };

      const ixData: sdk.MintResearchPaperInstructionArgs = {
        mintResearchPaper: data,
      };

      const instruction = sdk.createMintResearchPaperInstruction(
        accounts,
        ixData,
        sdk.PROGRAM_ID
      );

      await this.buildTxSignAndSend([instruction]);
    } catch (e) {
      console.error(e);
    }
  }
}

function deriveResearcherProfilePdaPubkeyAndBump(
  researcherAccount: solana.PublicKey
): [solana.PublicKey, number] {
  const seeds = [
    Buffer.from(RESEARCHER_PROFILE_PDA_SEED),
    researcherAccount.toBuffer(),
  ];

  const [researcherProfilePda, bump] = solana.PublicKey.findProgramAddressSync(
    seeds,
    sdk.PROGRAM_ID
  );

  return [researcherProfilePda, bump];
}

function deriveResearPaperPdaPubkeyAndBump(
  researcherAccount: solana.PublicKey,
  paperContentHash: string
): [solana.PublicKey, number] {
  const seeds = [
    Buffer.from(RESEARCH_PAPER_PDA_SEED),
    Buffer.from(paperContentHash),
    researcherAccount.toBuffer(),
  ];

  const [paperPda, bump] = solana.PublicKey.findProgramAddressSync(
    seeds,
    sdk.PROGRAM_ID
  );

  return [paperPda, bump];
}

function derivePeerReviewPdaPubkeyAndBump(
  researcherAcc: solana.PublicKey,
  paperPda: solana.PublicKey
): [solana.PublicKey, number] {
  const seeds = [
    Buffer.from("deres_peer_review"),
    paperPda.toBuffer(),
    researcherAcc.toBuffer(),
  ];

  const [peerReviewPda, bump] = solana.PublicKey.findProgramAddressSync(
    seeds,
    sdk.PROGRAM_ID
  );

  return [peerReviewPda, bump];
}

function deriveResearchMintCollectionPdaPubkeyAndBump(
  researcherAcc: solana.PublicKey
): [solana.PublicKey, number] {
  const seeds = [
    Buffer.from(RESEARCH_MINT_COLLECTION_PDA_SEED),
    researcherAcc.toBuffer(),
  ];

  const [mintCollectionPda, bump] = solana.PublicKey.findProgramAddressSync(
    seeds,
    sdk.PROGRAM_ID
  );

  return [mintCollectionPda, bump];
}
