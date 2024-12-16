'use client'

import { getKeiyakusolanadappProgram, getKeiyakusolanadappProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'

export function useKeiyakusolanadappProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getKeiyakusolanadappProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getKeiyakusolanadappProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['keiyakusolanadapp', 'all', { cluster }],
    queryFn: () => program.account.keiyakusolanadapp.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['keiyakusolanadapp', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ keiyakusolanadapp: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useKeiyakusolanadappProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useKeiyakusolanadappProgram()

  const accountQuery = useQuery({
    queryKey: ['keiyakusolanadapp', 'fetch', { cluster, account }],
    queryFn: () => program.account.keiyakusolanadapp.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['keiyakusolanadapp', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ keiyakusolanadapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['keiyakusolanadapp', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ keiyakusolanadapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['keiyakusolanadapp', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ keiyakusolanadapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['keiyakusolanadapp', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ keiyakusolanadapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
