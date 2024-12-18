"use client";

import {
  getKeiyakusolanadappProgram,
  getKeiyakusolanadappProgramId,
} from "@project/anchor";
import { BN } from "@coral-xyz/anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import { Cluster, PublicKey } from "@solana/web3.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { useCluster } from "../cluster/cluster-data-access";
import { useAnchorProvider } from "../solana/solana-provider";
import { useTransactionToast } from "../ui/ui-layout";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

type CreateVestingAccountArgs = {
  companyName: string;
  mint: string;
};

type CreateEmployeeArgs = {
  startTime: number;
  endTime: number;
  totalAmount: number;
  cliffTime: number;
  beneficiary: string;
};

export function useKeiyakuProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getKeiyakusolanadappProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = useMemo(
    () => getKeiyakusolanadappProgram(provider, programId),
    [provider, programId]
  );

  const accounts = useQuery({
    queryKey: ["keiyakusolanadapp", "all", { cluster }],
    queryFn: () => program.account.vestingAccount.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ["get-program-account", { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const createVestingAccount = useMutation<
    string,
    Error,
    CreateVestingAccountArgs
  >({
    mutationKey: ["vesting-account", "initialize", { cluster }],
    mutationFn: ({ companyName, mint }) =>
      program.methods
        .createVestingAccount(companyName)
        .accounts({ mint: new PublicKey(mint), tokenProgram: TOKEN_PROGRAM_ID })
        .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: () => toast.error("Failed to create the vesting account"),
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    createVestingAccount,
  };
}

export function useKeiyakuProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = useKeiyakuProgram();

  const accountQuery = useQuery({
    queryKey: ["keiyakusolanadapp", "fetch", { cluster, account }],
    queryFn: () => program.account.vestingAccount.fetch(account),
  });

  const createEmployeeVestingAccount = useMutation<
    string,
    Error,
    CreateEmployeeArgs
  >({
    mutationKey: ["vesting-account", "initialize", { cluster }],
    mutationFn: ({ startTime, endTime, totalAmount, cliffTime, beneficiary }) =>
      program.methods
        .createEmployee(
          new BN(startTime),
          new BN(endTime),
          new BN(totalAmount),
          new BN(cliffTime)
        )
        .accounts({
          beneficiary: new PublicKey(beneficiary),
          vestingAccount: account,
        })
        .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: () => toast.error("Failed to create the employee account"),
  });

  return {
    accountQuery,
    createEmployeeVestingAccount,
  };
}
