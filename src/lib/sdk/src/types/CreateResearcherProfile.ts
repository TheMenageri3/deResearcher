/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
export type CreateResearcherProfile = {
  name: string
  metaDataMerkleRoot: string
  pdaBump: number
}

/**
 * @category userTypes
 * @category generated
 */
export const createResearcherProfileBeet =
  new beet.FixableBeetArgsStruct<CreateResearcherProfile>(
    [
      ['name', beet.utf8String],
      ['metaDataMerkleRoot', beet.utf8String],
      ['pdaBump', beet.u8],
    ],
    'CreateResearcherProfile'
  )
