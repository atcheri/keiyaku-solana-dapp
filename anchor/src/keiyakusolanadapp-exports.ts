// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import KeiyakusolanadappIDL from '../target/idl/keiyakusolanadapp.json'
import type { Keiyakusolanadapp } from '../target/types/keiyakusolanadapp'

// Re-export the generated IDL and type
export { Keiyakusolanadapp, KeiyakusolanadappIDL }

// The programId is imported from the program IDL.
export const KEIYAKUSOLANADAPP_PROGRAM_ID = new PublicKey(KeiyakusolanadappIDL.address)

// This is a helper function to get the Keiyakusolanadapp Anchor program.
export function getKeiyakusolanadappProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...KeiyakusolanadappIDL, address: address ? address.toBase58() : KeiyakusolanadappIDL.address } as Keiyakusolanadapp, provider)
}

// This is a helper function to get the program ID for the Keiyakusolanadapp program depending on the cluster.
export function getKeiyakusolanadappProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Keiyakusolanadapp program on devnet and testnet.
      return new PublicKey('coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF')
    case 'mainnet-beta':
    default:
      return KEIYAKUSOLANADAPP_PROGRAM_ID
  }
}
