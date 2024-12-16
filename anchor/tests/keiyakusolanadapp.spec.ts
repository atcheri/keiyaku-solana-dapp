import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {Keiyakusolanadapp} from '../target/types/keiyakusolanadapp'

describe('keiyakusolanadapp', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Keiyakusolanadapp as Program<Keiyakusolanadapp>

  const keiyakusolanadappKeypair = Keypair.generate()

  it('Initialize Keiyakusolanadapp', async () => {
    await program.methods
      .initialize()
      .accounts({
        keiyakusolanadapp: keiyakusolanadappKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([keiyakusolanadappKeypair])
      .rpc()

    const currentCount = await program.account.keiyakusolanadapp.fetch(keiyakusolanadappKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Keiyakusolanadapp', async () => {
    await program.methods.increment().accounts({ keiyakusolanadapp: keiyakusolanadappKeypair.publicKey }).rpc()

    const currentCount = await program.account.keiyakusolanadapp.fetch(keiyakusolanadappKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Keiyakusolanadapp Again', async () => {
    await program.methods.increment().accounts({ keiyakusolanadapp: keiyakusolanadappKeypair.publicKey }).rpc()

    const currentCount = await program.account.keiyakusolanadapp.fetch(keiyakusolanadappKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Keiyakusolanadapp', async () => {
    await program.methods.decrement().accounts({ keiyakusolanadapp: keiyakusolanadappKeypair.publicKey }).rpc()

    const currentCount = await program.account.keiyakusolanadapp.fetch(keiyakusolanadappKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set keiyakusolanadapp value', async () => {
    await program.methods.set(42).accounts({ keiyakusolanadapp: keiyakusolanadappKeypair.publicKey }).rpc()

    const currentCount = await program.account.keiyakusolanadapp.fetch(keiyakusolanadappKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the keiyakusolanadapp account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        keiyakusolanadapp: keiyakusolanadappKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.keiyakusolanadapp.fetchNullable(keiyakusolanadappKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
