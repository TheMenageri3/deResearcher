import { WalletContextState } from "@solana/wallet-adapter-react";
import { Transaction, TransactionInstruction } from "@solana/web3.js";
import { Connection, Cluster } from "@solana/web3.js";
import * as sdk from "./index";
import * as solana from "@solana/web3.js";
import { WebIrys } from "@irys/sdk";
import {
  MAX_PDF_UPLOD_SIZE_BYTES,
  RESEARCH_MINT_COLLECTION_PDA_SEED,
  RESEARCH_PAPER_PDA_SEED,
  RESEARCHER_PROFILE_PDA_SEED,
} from "../constants";
import {
  getConnection,
  getPaperContentHashForSeeds,
  getRPCUrlFromCluster,
} from "@/lib/helpers";
import { WebUploader } from "@irys/web-upload";
import { WebSolana } from "@irys/web-upload-solana";
import BigNumber from "bignumber.js";
import { TaggedFile } from "@irys/sdk/web/upload";

export class SDK {
  wallet: WalletContextState;
  pubkey: solana.PublicKey;
  connection: Connection;

  constructor(wallet: WalletContextState, cluster: Cluster) {
    if (!wallet.publicKey) {
      throw new Error("Wallet does not have a public key");
    }
    this.wallet = wallet;
    this.pubkey = wallet.publicKey;
    this.connection = getConnection(cluster);
  }

  public async signTransaction(tx: Transaction): Promise<Transaction> {
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

    const recentBlockhash = await this.connection.getLatestBlockhash();

    tx.recentBlockhash = recentBlockhash.blockhash;

    tx.lastValidBlockHeight = recentBlockhash.lastValidBlockHeight;

    tx.feePayer = this.pubkey;

    instructions.forEach((instruction) => tx.add(instruction));

    const signedTx = await this.signTransaction(tx);

    const txId = await this.connection.sendRawTransaction(signedTx.serialize());

    console.log("Transaction sent", txId);

    await this.confirmTransaction(txId);
  }

  async getArweaveIrys() {
    // const irysUploader = await WebUploader(WebSolana).withProvider(this.wallet);

    // return irysUploader;

    // // TODO: SETUP RPC_URL ENV VAR
    const rpcUrl = getRPCUrlFromCluster("devnet");

    const irisWallet = {
      rpcUrl: rpcUrl,
      name: "solana",
      provider: this.wallet,
    };
    const webIrys = new WebIrys({
      network: "devnet",
      token: "solana",
      wallet: irisWallet,
    });
    await webIrys.ready();
    return webIrys;
  }

  async arweaveFundNode(amount: BigNumber): Promise<void> {
    const webIrys = await this.getArweaveIrys();
    try {
      const fundTx = await webIrys.fund(
        webIrys.utils.toAtomic(amount.multipliedBy(2))
      );
      console.log(
        `Successfully funded ${webIrys.utils.fromAtomic(fundTx.quantity)} ${
          webIrys.token
        }`
      );
    } catch (e) {
      console.log("Error uploading data ", e);
    }
  }

  async arweaveGetBalance(): Promise<BigNumber> {
    const webIrys = await this.getArweaveIrys();
    const balance = await webIrys.getLoadedBalance();
    return webIrys.utils.fromAtomic(balance);
  }

  async arweaveUploadFiles(
    filesToUpload: File[],
    tags: { name: string; value: string }[][] = []
  ): Promise<string[]> {
    const taggedFiles = filesToUpload.map((f: TaggedFile, i: number) => {
      f.tags = tags[i];
      return f;
    });

    const irysUploader = await this.getArweaveIrys();

    const totalSize = taggedFiles.reduce((acc, file) => acc + file.size, 0);

    const price = await this.arweaveGetPrice(totalSize);

    if (!price) {
      throw new Error("Error getting price");
    }

    const balance = await this.arweaveGetBalance();

    const fundingAmount = price.minus(balance);

    if (fundingAmount.gt(0)) {
      await this.arweaveFundNode(fundingAmount);
    }

    const response = await irysUploader.uploadFolder(taggedFiles, {});

    const receipts = response.txs.map(
      (tx) => "https://gateway.irys.xyz/" + tx.id
    );

    console.log("receipts", receipts);

    return receipts;
  }

  async arweaveGetPrice(size: number): Promise<BigNumber> {
    const webIrys = await this.getArweaveIrys();
    let price = await webIrys.getPrice(size);

    price = webIrys.utils.fromAtomic(price);

    return price;
  }

  async arweaveUploadFile(
    fileToUpload: File,
    tags: {
      name: string;
      value: string;
    }[]
  ): Promise<string> {
    if (fileToUpload.type !== "application/pdf") {
      throw new Error("Invalid file type");
    }

    if (fileToUpload.size > MAX_PDF_UPLOD_SIZE_BYTES) {
      throw new Error("File size too large");
    }
    const webIrys = await this.getArweaveIrys();

    const price = await this.arweaveGetPrice(fileToUpload.size);

    if (!price) {
      throw new Error("Error getting price");
    }

    const balance = await this.arweaveGetBalance();

    const fundingAmount = price.minus(balance);

    if (fundingAmount.gt(0)) {
      await this.arweaveFundNode(fundingAmount);
    }

    const receipt = await webIrys.uploadFile(fileToUpload, { tags: tags });

    console.log("receipt", receipt);

    return "https://gateway.irys.xyz/" + receipt.id;
  }

  public async createResearcherProfile(
    data: Omit<sdk.CreateResearcherProfile, "pdaBump">
  ): Promise<sdk.ResearcherProfile> {
    const [researcherProfilePda, bump] =
      deriveResearcherProfilePdaPubkeyAndBump(this.pubkey);

    const accounts: sdk.CreateResearcherProfileInstructionAccounts = {
      researcherAcc: this.pubkey,
      researcherProfilePdaAcc: researcherProfilePda,
      systemProgramAcc: solana.SystemProgram.programId,
    };

    const ixData: sdk.CreateResearcherProfileInstructionArgs = {
      createResearcherProfile: {
        ...data,
        pdaBump: bump,
      },
    };

    const instruction = sdk.createCreateResearcherProfileInstruction(
      accounts,
      ixData,
      sdk.PROGRAM_ID
    );

    await this.buildTxSignAndSend([instruction]);

    const researcherProfile = await sdk.ResearcherProfile.fromAccountAddress(
      this.connection,
      researcherProfilePda
    );

    return researcherProfile;
  }

  async createResearchPaper(
    data: Omit<sdk.CreateResearchePaper, "pdaBump">
  ): Promise<sdk.ResearchPaper> {
    const [paperPda, bump] = deriveResearPaperPdaPubkeyAndBump(
      this.pubkey,
      data.paperContentHash
    );

    const [researcherProfilePda, _bump] =
      deriveResearcherProfilePdaPubkeyAndBump(this.pubkey);

    const accounts: sdk.CreateResearchePaperInstructionAccounts = {
      publisherAcc: this.pubkey,
      researcherProfilePdaAcc: researcherProfilePda,
      paperPdaAcc: paperPda,
      systemProgramAcc: solana.SystemProgram.programId,
    };

    const ixData: sdk.CreateResearchePaperInstructionArgs = {
      createResearchePaper: {
        ...data,
        pdaBump: bump,
      },
    };

    const instruction = sdk.createCreateResearchePaperInstruction(
      accounts,
      ixData,
      sdk.PROGRAM_ID
    );

    await this.buildTxSignAndSend([instruction]);

    const paper = await sdk.ResearchPaper.fromAccountAddress(
      this.connection,
      paperPda
    );

    return paper;
  }

  async publishResearchPaper(
    paperPda: string,
    pdaBump: number
  ): Promise<sdk.ResearchPaper> {
    const accounts: sdk.PublishPaperInstructionAccounts = {
      publisherAcc: this.pubkey,
      paperPdaAcc: new solana.PublicKey(paperPda),
    };

    const instruction = sdk.createPublishPaperInstruction(accounts, {
      publishPaper: {
        pdaBump,
      },
    });

    await this.buildTxSignAndSend([instruction]);

    const paper = await sdk.ResearchPaper.fromAccountAddress(
      this.connection,
      new solana.PublicKey(paperPda)
    );

    return paper;
  }

  async addPeerReview(
    paperPda: string,
    data: Omit<sdk.AddPeerReview, "pdaBump">
  ): Promise<sdk.PeerReview> {
    const [peerReviewPda, bump] = derivePeerReviewPdaPubkeyAndBump(
      this.pubkey,
      new solana.PublicKey(paperPda)
    );

    const [researcherProfilePda, _] = deriveResearcherProfilePdaPubkeyAndBump(
      this.pubkey
    );

    const accounts: sdk.AddPeerReviewInstructionAccounts = {
      reviewerAcc: this.pubkey,
      researcherProfilePdaAcc: researcherProfilePda,
      paperPdaAcc: new solana.PublicKey(paperPda),
      peerReviewPdaAcc: peerReviewPda,
      systemProgramAcc: solana.SystemProgram.programId,
    };

    const ixData: sdk.AddPeerReviewInstructionArgs = {
      addPeerReview: {
        ...data,
        pdaBump: bump,
      },
    };

    const instruction = sdk.createAddPeerReviewInstruction(
      accounts,
      ixData,
      sdk.PROGRAM_ID
    );

    await this.buildTxSignAndSend([instruction]);

    const peerReview = await sdk.PeerReview.fromAccountAddress(
      this.connection,
      peerReviewPda
    );

    return peerReview;
  }

  async mintResearchPaper(
    paperPda: string,
    data: Omit<sdk.MintResearchPaper, "pdaBump">
  ): Promise<sdk.ResearchMintCollection> {
    const [mintCollectionPda, bump] =
      deriveResearchMintCollectionPdaPubkeyAndBump(this.pubkey);

    const [researcherProfilePda, researcherProfileBump] =
      deriveResearcherProfilePdaPubkeyAndBump(this.pubkey);

    const paper = await sdk.ResearchPaper.fromAccountAddress(
      this.connection,
      new solana.PublicKey(paperPda)
    );

    const accounts: sdk.MintResearchPaperInstructionAccounts = {
      readerAcc: this.pubkey,
      paperPdaAcc: new solana.PublicKey(paperPda),
      researcherProfilePdaAcc: researcherProfilePda,
      researchMintCollectionPdaAcc: mintCollectionPda,
      feeReceiverAcc: paper.creatorPubkey,
      systemProgramAcc: solana.SystemProgram.programId,
    };

    const ixData: sdk.MintResearchPaperInstructionArgs = {
      mintResearchPaper: {
        ...data,
        pdaBump: bump,
      },
    };

    const instruction = sdk.createMintResearchPaperInstruction(
      accounts,
      ixData,
      sdk.PROGRAM_ID
    );

    await this.buildTxSignAndSend([instruction]);

    const mintCollection = await sdk.ResearchMintCollection.fromAccountAddress(
      this.connection,
      mintCollectionPda
    );

    return mintCollection;
  }

  async fetchResearcherProfileByPubkey(researcherPda: solana.PublicKey) {
    try {
      return await sdk.ResearcherProfile.fromAccountAddress(
        this.connection,
        researcherPda
      );
    } catch (e) {
      console.error(e);
    }
  }

  async fetchAllResearcherProfiles() {
    try {
      const gpaBuilder = sdk.ResearcherProfile.gpaBuilder(sdk.PROGRAM_ID);
      const accountsWithPubkeys = await gpaBuilder.run(this.connection);

      const researcherProfiles: sdk.ResearcherProfile[] = [];

      for (const account of accountsWithPubkeys) {
        const [researcherProfile, _index] =
          sdk.ResearcherProfile.fromAccountInfo(account.account);

        researcherProfiles.push(researcherProfile);
      }

      return researcherProfiles;
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async fetchResearchPaperByPubkey(paperPda: solana.PublicKey) {
    try {
      return await sdk.ResearchPaper.fromAccountAddress(
        this.connection,
        paperPda
      );
    } catch (e) {
      console.error(e);
    }
  }

  async fetchAllResearchPapers() {
    try {
      const gpaBuilder = sdk.ResearchPaper.gpaBuilder(sdk.PROGRAM_ID);
      const accountsWithPubkeys = await gpaBuilder.run(this.connection);

      const researchPapers: sdk.ResearchPaper[] = [];

      for (const account of accountsWithPubkeys) {
        const [researchPaper, _index] = sdk.ResearchPaper.fromAccountInfo(
          account.account
        );

        researchPapers.push(researchPaper);
      }

      return researchPapers;
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async fetchPeerReviewByPubkey(peerReviewPda: solana.PublicKey) {
    try {
      return await sdk.PeerReview.fromAccountAddress(
        this.connection,
        peerReviewPda
      );
    } catch (e) {
      console.error(e);
    }
  }

  async fetchAllPeerReviews() {
    try {
      const gpaBuilder = sdk.PeerReview.gpaBuilder(sdk.PROGRAM_ID);
      const accountsWithPubkeys = await gpaBuilder.run(this.connection);

      const peerReviews: sdk.PeerReview[] = [];

      for (const account of accountsWithPubkeys) {
        const [peerReview, _index] = sdk.PeerReview.fromAccountInfo(
          account.account
        );

        peerReviews.push(peerReview);
      }

      return peerReviews;
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async fetchResearchMintCollectionByPubkey(
    mintCollectionPda: solana.PublicKey
  ) {
    try {
      return await sdk.ResearchMintCollection.fromAccountAddress(
        this.connection,
        mintCollectionPda
      );
    } catch (e) {
      console.error(e);
    }
  }

  async fetchResearchMintCollectionByResearcherPubkey(
    researcherAcc: solana.PublicKey
  ) {
    try {
      const gpaBuilder = sdk.ResearchMintCollection.gpaBuilder(sdk.PROGRAM_ID);
      gpaBuilder.addInnerFilter("readerPubkey", researcherAcc.toBase58());
      const accountsWithPubkeys = await gpaBuilder.run(this.connection);

      const mintCollections: sdk.ResearchMintCollection[] = [];

      for (const account of accountsWithPubkeys) {
        const [mintCollection, _index] =
          sdk.ResearchMintCollection.fromAccountInfo(account.account);

        mintCollections.push(mintCollection);
      }

      return mintCollections;
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async fetchResearchPapersByResearcherPubkey(researcherAcc: solana.PublicKey) {
    try {
      const gpaBuilder = sdk.ResearchPaper.gpaBuilder(sdk.PROGRAM_ID);
      gpaBuilder.addInnerFilter("creatorPubkey", researcherAcc.toBase58());
      const accountsWithPubkeys = await gpaBuilder.run(this.connection);

      const researchPapers: sdk.ResearchPaper[] = [];

      for (const account of accountsWithPubkeys) {
        const [researchPaper, _index] = sdk.ResearchPaper.fromAccountInfo(
          account.account
        );

        researchPapers.push(researchPaper);
      }

      return researchPapers;
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async fetchPeerReviewsByResearcherPubkey(researcherAcc: solana.PublicKey) {
    try {
      const gpaBuilder = sdk.PeerReview.gpaBuilder(sdk.PROGRAM_ID);
      gpaBuilder.addInnerFilter("reviewerPubkey", researcherAcc.toBase58());
      const accountsWithPubkeys = await gpaBuilder.run(this.connection);

      const peerReviews: sdk.PeerReview[] = [];

      for (const account of accountsWithPubkeys) {
        const [peerReview, _index] = sdk.PeerReview.fromAccountInfo(
          account.account
        );

        peerReviews.push(peerReview);
      }

      return peerReviews;
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  static async compressObjectAndGenerateMerkleRoot<T extends Object>(
    obj: T
  ): Promise<string> {
    const apiRoute = "/api/generate-merkle-root";

    const response = await fetch(apiRoute, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(obj),
    });

    if (!response.ok) {
      throw new Error("Error generating merkle root");
    }

    const data = await response.json();

    return data.data.merkleRoot;
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
    Buffer.from(getPaperContentHashForSeeds(paperContentHash)),
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
