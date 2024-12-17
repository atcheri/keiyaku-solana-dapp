import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { startAnchor, ProgramTestContext, BanksClient } from "solana-bankrun";
import { BankrunProvider } from "anchor-bankrun";
import { Keiyakusolanadapp } from "../target/types/keiyakusolanadapp";
import IDL from "../target/idl/keiyakusolanadapp.json";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
// @ts-ignore:next-line
import { createMint, mintTo } from "spl-token-bankrun";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";

describe("keiyaku-solana-dapp", () => {
  const testCompanyName = "test company name";
  let beneficiary: Keypair;
  let context: ProgramTestContext;
  let provider: BankrunProvider;
  let program: Program<Keiyakusolanadapp>;
  let banksClient: BanksClient;
  let employer: Keypair;
  let mint: PublicKey;
  let beneficiaryProvider: BankrunProvider;
  let program2: Program<Keiyakusolanadapp>;
  let vestingAccountKey: PublicKey;
  let treasuryTokenAccount: PublicKey;
  let employeeAccount: PublicKey;

  beforeAll(async () => {
    beneficiary = new anchor.web3.Keypair();
    context = await startAnchor(
      "",
      [
        {
          name: "keiyakusolanadapp",
          programId: new PublicKey(IDL.address),
        },
      ],
      [
        {
          address: beneficiary.publicKey,
          info: {
            lamports: 1_000_000_000,
            data: Buffer.alloc(0),
            owner: SYSTEM_PROGRAM_ID,
            executable: false,
          },
        },
      ]
    );
    provider = new BankrunProvider(context);
    anchor.setProvider(provider);
    program = new Program<Keiyakusolanadapp>(
      IDL as Keiyakusolanadapp,
      provider
    );
    banksClient = context.banksClient;
    employer = provider.wallet.payer;
    // @ts-ignore-error - Type error in spl-token-bankrun dependency
    mint = await createMint(banksClient, employer, employer.publicKey, null, 2);

    beneficiaryProvider = new BankrunProvider(context);
    beneficiaryProvider.wallet = new NodeWallet(beneficiary);

    program2 = new Program<Keiyakusolanadapp>(
      IDL as Keiyakusolanadapp,
      beneficiaryProvider
    );

    [vestingAccountKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(testCompanyName)],
      program.programId
    );
    [treasuryTokenAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("vesting_treasury"), Buffer.from(testCompanyName)],
      program.programId
    );
    [employeeAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("employee_vesting"),
        beneficiary.publicKey.toBuffer(),
        vestingAccountKey.toBuffer(),
      ],
      program.programId
    );
  });

  it("creates a vesting account", async () => {
    await expect(
      program.methods
        .createVestingAccount(testCompanyName)
        .accounts({
          signer: employer.publicKey,
          mint,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc({ commitment: "confirmed" })
    ).resolves.toBeDefined();
  });

  it("funds the treasury token account", async () => {
    const amount = 10_000 * 10 ** 9;

    await expect(
      mintTo(
        banksClient,
        employer,
        mint,
        treasuryTokenAccount,
        employer,
        amount
      )
    ).resolves.toBeDefined();
  });
});
