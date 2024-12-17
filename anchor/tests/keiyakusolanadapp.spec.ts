import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import {
  startAnchor,
  ProgramTestContext,
  BanksClient,
  Clock,
} from "solana-bankrun";
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

  it("creates an employee vesting account", async () => {
    const startTime = new BN(0);
    const endTime = new BN(100);
    const totalAmount = new BN(100);
    const cliffTime = new BN(0);
    await expect(
      program.methods
        .createEmployee(startTime, endTime, totalAmount, cliffTime)
        .accounts({
          beneficiary: beneficiary.publicKey,
          vestingAccount: vestingAccountKey,
        })
        .rpc({ commitment: "confirmed", skipPreflight: true })
    ).resolves.toBeDefined();
  });

  it("claims the employee's vested tokens", async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const currentClock = await banksClient.getClock();
    context.setClock(
      new Clock(
        currentClock.slot,
        currentClock.epochStartTimestamp,
        currentClock.epoch,
        currentClock.leaderScheduleEpoch,
        BigInt(1000)
      )
    );

    await expect(
      program2.methods
        .claimTokens(testCompanyName)
        .accounts({ tokenProgram: TOKEN_PROGRAM_ID })
        .rpc({ commitment: "confirmed" })
    ).resolves.toBeDefined();
  });
});
