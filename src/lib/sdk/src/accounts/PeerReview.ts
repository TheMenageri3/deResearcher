/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as web3 from '@solana/web3.js'
import * as beetSolana from '@metaplex-foundation/beet-solana'
import * as beet from '@metaplex-foundation/beet'

/**
 * Arguments used to create {@link PeerReview}
 * @category Accounts
 * @category generated
 */
export type PeerReviewArgs = {
  address: web3.PublicKey
  reviewerPubkey: web3.PublicKey
  paperPubkey: web3.PublicKey
  qualityOfResearch: number
  potentialForRealWorldUseCase: number
  domainKnowledge: number
  practicalityOfResultObtained: number
  metaDataMerkleRoot: number[] /* size: 64 */
  bump: number
}
/**
 * Holds the data for the {@link PeerReview} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
export class PeerReview implements PeerReviewArgs {
  private constructor(
    readonly address: web3.PublicKey,
    readonly reviewerPubkey: web3.PublicKey,
    readonly paperPubkey: web3.PublicKey,
    readonly qualityOfResearch: number,
    readonly potentialForRealWorldUseCase: number,
    readonly domainKnowledge: number,
    readonly practicalityOfResultObtained: number,
    readonly metaDataMerkleRoot: number[] /* size: 64 */,
    readonly bump: number
  ) {}

  /**
   * Creates a {@link PeerReview} instance from the provided args.
   */
  static fromArgs(args: PeerReviewArgs) {
    return new PeerReview(
      args.address,
      args.reviewerPubkey,
      args.paperPubkey,
      args.qualityOfResearch,
      args.potentialForRealWorldUseCase,
      args.domainKnowledge,
      args.practicalityOfResultObtained,
      args.metaDataMerkleRoot,
      args.bump
    )
  }

  /**
   * Deserializes the {@link PeerReview} from the data of the provided {@link web3.AccountInfo}.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static fromAccountInfo(
    accountInfo: web3.AccountInfo<Buffer>,
    offset = 0
  ): [PeerReview, number] {
    return PeerReview.deserialize(accountInfo.data, offset)
  }

  /**
   * Retrieves the account info from the provided address and deserializes
   * the {@link PeerReview} from its data.
   *
   * @throws Error if no account info is found at the address or if deserialization fails
   */
  static async fromAccountAddress(
    connection: web3.Connection,
    address: web3.PublicKey,
    commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig
  ): Promise<PeerReview> {
    const accountInfo = await connection.getAccountInfo(
      address,
      commitmentOrConfig
    )
    if (accountInfo == null) {
      throw new Error(`Unable to find PeerReview account at ${address}`)
    }
    return PeerReview.fromAccountInfo(accountInfo, 0)[0]
  }

  /**
   * Provides a {@link web3.Connection.getProgramAccounts} config builder,
   * to fetch accounts matching filters that can be specified via that builder.
   *
   * @param programId - the program that owns the accounts we are filtering
   */
  static gpaBuilder(
    programId: web3.PublicKey = new web3.PublicKey(
      'BdtzNv4J5DSCA52xK6KLyKG5qorajuwfmJV2WivPkRsW'
    )
  ) {
    return beetSolana.GpaBuilder.fromStruct(programId, peerReviewBeet)
  }

  /**
   * Deserializes the {@link PeerReview} from the provided data Buffer.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static deserialize(buf: Buffer, offset = 0): [PeerReview, number] {
    return peerReviewBeet.deserialize(buf, offset)
  }

  /**
   * Serializes the {@link PeerReview} into a Buffer.
   * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
   */
  serialize(): [Buffer, number] {
    return peerReviewBeet.serialize(this)
  }

  /**
   * Returns the byteSize of a {@link Buffer} holding the serialized data of
   * {@link PeerReview}
   */
  static get byteSize() {
    return peerReviewBeet.byteSize
  }

  /**
   * Fetches the minimum balance needed to exempt an account holding
   * {@link PeerReview} data from rent
   *
   * @param connection used to retrieve the rent exemption information
   */
  static async getMinimumBalanceForRentExemption(
    connection: web3.Connection,
    commitment?: web3.Commitment
  ): Promise<number> {
    return connection.getMinimumBalanceForRentExemption(
      PeerReview.byteSize,
      commitment
    )
  }

  /**
   * Determines if the provided {@link Buffer} has the correct byte size to
   * hold {@link PeerReview} data.
   */
  static hasCorrectByteSize(buf: Buffer, offset = 0) {
    return buf.byteLength - offset === PeerReview.byteSize
  }

  /**
   * Returns a readable version of {@link PeerReview} properties
   * and can be used to convert to JSON and/or logging
   */
  pretty() {
    return {
      address: this.address.toBase58(),
      reviewerPubkey: this.reviewerPubkey.toBase58(),
      paperPubkey: this.paperPubkey.toBase58(),
      qualityOfResearch: this.qualityOfResearch,
      potentialForRealWorldUseCase: this.potentialForRealWorldUseCase,
      domainKnowledge: this.domainKnowledge,
      practicalityOfResultObtained: this.practicalityOfResultObtained,
      metaDataMerkleRoot: this.metaDataMerkleRoot,
      bump: this.bump,
    }
  }
}

/**
 * @category Accounts
 * @category generated
 */
export const peerReviewBeet = new beet.BeetStruct<PeerReview, PeerReviewArgs>(
  [
    ['address', beetSolana.publicKey],
    ['reviewerPubkey', beetSolana.publicKey],
    ['paperPubkey', beetSolana.publicKey],
    ['qualityOfResearch', beet.u8],
    ['potentialForRealWorldUseCase', beet.u8],
    ['domainKnowledge', beet.u8],
    ['practicalityOfResultObtained', beet.u8],
    ['metaDataMerkleRoot', beet.uniformFixedSizeArray(beet.u8, 64)],
    ['bump', beet.u8],
  ],
  PeerReview.fromArgs,
  'PeerReview'
)
