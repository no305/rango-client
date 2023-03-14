import { ExecuterActions, QueueType } from '@rango-dev/queue-manager-core';
import {
  BlockReason,
  SwapActionTypes,
  SwapQueueContext,
  SwapQueueDef,
  SwapStorage,
} from './types';
import {
  EvmBlockchainMeta,
  getBlockChainNameFromId,
  Meta,
  Network,
  Transaction,
  TransactionType,
  WalletState,
  WalletType,
} from '@rango-dev/wallets-shared';
import { Providers, readAccountAddress } from '@rango-dev/wallets-core';

import {
  TronTransaction,
  StarknetTransaction,
  CosmosTransaction,
  EvmTransaction,
  SolanaTransaction,
  Transfer as TransferTransaction,
} from 'rango-sdk';

import {
  ERROR_MESSAGE_WAIT_FOR_CHANGE_NETWORK,
  ERROR_MESSAGE_WAIT_FOR_WALLET,
  ERROR_MESSAGE_WAIT_FOR_WALLET_DESCRIPTION,
} from './constants';
import { Manager } from '@rango-dev/queue-manager-core';
import { Status } from '@rango-dev/queue-manager-core';
import {
  EventType,
  getCurrentBlockchainOf,
  getCurrentBlockchainOfOrNull,
  getEvmApproveUrl,
  getRelatedWalletOrNull,
  MessageSeverity,
  PendingSwap,
  PendingSwapNetworkStatus,
  PendingSwapStep,
  prettifyErrorMessage,
  StepStatus,
  SwapStatus,
  Wallet,
  WalletTypeAndAddress,
} from './shared';
import { logRPCError } from './shared-sentry';
import { PrettyError } from './shared-errors';
import { mapAppErrorCodesToAPIErrorCode, reportFailed } from './shared-api';

type WhenTaskBlocked = Parameters<NonNullable<SwapQueueDef['whenTaskBlocked']>>;
type WhenTaskBlockedEvent = WhenTaskBlocked[0];
type WhenTaskBlockedMeta = WhenTaskBlocked[1];

let swapClaimedBy: { id: string } | null = null;

/**
 *
 * We simply use module-level variable to keep track of which queue has claimed the execution of parallel runnings.
 *
 */
function claimQueue() {
  return {
    claimedBy: () => swapClaimedBy?.id,
    setClaimer: (queue_id: string) => {
      swapClaimedBy = {
        id: queue_id,
      };
    },
    reset: () => {
      swapClaimedBy = null;
    },
  };
}

/**
 *
 * Returns `steps`, if it's a `running` swap.
 * Each `PendingSwap` has a `steps` inside it, `steps` shows how many tasks should be created and run to finish the swap.
 *
 */
export const getCurrentStep = (swap: PendingSwap): PendingSwapStep | null => {
  return (
    swap.steps.find(
      (step) => step.status !== 'failed' && step.status !== 'success'
    ) || null
  );
};

/**
 * When we are doing a swap, there are some common fields that will be updated together.
 * This function helps us to update a swap status and also it will update some more fields like `extraMessageSeverity` based on the input.
 */
export function updateSwapStatus({
  getStorage,
  setStorage,
  nextStatus,
  nextStepStatus,
  message,
  details,
  errorCode = null,
}: {
  getStorage: ExecuterActions<
    SwapStorage,
    SwapActionTypes,
    SwapQueueContext
  >['getStorage'];
  setStorage: ExecuterActions<
    SwapStorage,
    SwapActionTypes,
    SwapQueueContext
  >['setStorage'];
  nextStatus?: SwapStatus;
  nextStepStatus?: StepStatus;
  message?: string;
  details?: string | null | undefined;
  errorCode?: string | null;
}): {
  swap: PendingSwap;
  step: PendingSwapStep | null;
} {
  const swap = getStorage().swapDetails;
  const currentStep = getCurrentStep(swap);
  if (!!nextStepStatus && !!currentStep) currentStep.status = nextStepStatus;

  if (!!nextStatus) swap.status = nextStatus;

  if (!!nextStatus && ['failed', 'success'].includes(nextStatus))
    swap.finishTime = new Date().getTime().toString();

  if (!!message) swap.extraMessage = message;

  if (!!details) swap.extraMessageDetail = details;

  if (!!nextStepStatus && ['failed'].includes(nextStepStatus)) {
    //if user cancel the swap, we should pass relevant reason to the server.
    const errorReason =
      details && details.includes('Warning')
        ? 'Swap canceled by user.'
        : details;
    swap.extraMessageSeverity = MessageSeverity.error;
    reportFailed(
      swap.requestId,
      currentStep?.id || 1,
      mapAppErrorCodesToAPIErrorCode(errorCode),
      errorReason || '',
      (currentStep
        ? getRelatedWalletOrNull(swap, currentStep)?.walletType
        : null) || null
    ).then();
  } else if (!!nextStepStatus && ['running'].includes(nextStepStatus))
    swap.extraMessageSeverity = MessageSeverity.info;
  else if (!!nextStepStatus && ['success', 'approved'].includes(nextStepStatus))
    swap.extraMessageSeverity = MessageSeverity.success;
  else if (nextStepStatus && ['waitingForApproval'].includes(nextStepStatus))
    swap.extraMessageSeverity = MessageSeverity.warning;

  if (nextStepStatus === 'running' && currentStep)
    currentStep.startTransactionTime = new Date().getTime();

  setStorage({
    ...getStorage(),
    swapDetails: swap,
  });

  return {
    swap,
    step: currentStep,
  };
}

export function setStepTransactionIds(
  { getStorage, setStorage }: ExecuterActions<SwapStorage, SwapActionTypes>,
  txId: string | null,
  eventType: EventType,
  notifier: SwapQueueContext['notifier']
): void {
  const swap = getStorage().swapDetails;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const currentStep = getCurrentStep(swap)!;
  currentStep.executedTransactionId = txId || currentStep.executedTransactionId;
  setStorage({
    ...getStorage(),
    swapDetails: swap,
  });
  notifier({ eventType: eventType, swap: swap, step: currentStep });
}

/**
 * If a swap needs a wallet to be connected,
 * By calling this function some related fields will be updated to show a correct message and state for notfiying the user.
 */
export function markRunningSwapAsWaitingForConnectingWallet(
  {
    getStorage,
    setStorage,
  }: Pick<ExecuterActions, 'getStorage' | 'setStorage'>,
  reason: string,
  reasonDetail: string
): void {
  const swap = getStorage().swapDetails as SwapStorage['swapDetails'];
  const currentStep = getCurrentStep(swap);
  if (!currentStep) return;
  const currentTime = new Date();
  swap.lastNotificationTime = currentTime.getTime().toString();

  const isAlreadyMarked =
    currentStep.networkStatus ===
      PendingSwapNetworkStatus.WaitingForConnectingWallet &&
    swap.networkStatusExtraMessage === reason &&
    swap.networkStatusExtraMessageDetail === reasonDetail;

  if (isAlreadyMarked) {
    return;
  }

  currentStep.networkStatus =
    PendingSwapNetworkStatus.WaitingForConnectingWallet;
  swap.networkStatusExtraMessage = reason;
  swap.networkStatusExtraMessageDetail = reasonDetail;

  setStorage({
    ...getStorage(),
    swapDetails: swap,
  });
}

/**
 * If a swap needs a certain network to proceed,
 * By calling this function some related fields will be updated to show a correct message and state for notfiying the user.
 */
export function markRunningSwapAsSwitchingNetwork({
  getStorage,
  setStorage,
}: Pick<ExecuterActions, 'getStorage' | 'setStorage'>):
  | {
      swap: PendingSwap;
      step: PendingSwapStep;
    }
  | undefined {
  const swap = getStorage().swapDetails as SwapStorage['swapDetails'];

  const currentStep = getCurrentStep(swap);
  if (!currentStep) return;

  // Generate message
  const { type } = getRequiredWallet(swap);
  const fromBlockchain = getCurrentBlockchainOf(swap, currentStep);
  const reason = `Change ${type} wallet network to ${fromBlockchain}`;
  let metamaskMessage = '';
  if (type === WalletType.META_MASK)
    metamaskMessage = `(Networks -> Select '${fromBlockchain}' network.)`;
  const reasonDetail = `Please change your ${type} wallet network to ${fromBlockchain}. ${metamaskMessage}`;

  const currentTime = new Date();
  swap.lastNotificationTime = currentTime.getTime().toString();

  currentStep.networkStatus = PendingSwapNetworkStatus.WaitingForNetworkChange;
  swap.networkStatusExtraMessage = reason;
  swap.networkStatusExtraMessageDetail = reasonDetail;

  setStorage({
    ...getStorage(),
    swapDetails: swap,
  });

  return {
    swap,
    step: currentStep,
  };
}

/**
 * We are marking the queue as it depends on other queues to be run (on Parallel mode)
 * By calling this function some related fields will be updated to show a correct message and state for notfiying the user.
 */
export function markRunningSwapAsDependsOnOtherQueues({
  getStorage,
  setStorage,
}: Pick<ExecuterActions, 'getStorage' | 'setStorage'>):
  | {
      swap: PendingSwap;
      step: PendingSwapStep;
    }
  | undefined {
  const swap = getStorage().swapDetails as SwapStorage['swapDetails'];
  const currentStep = getCurrentStep(swap);
  if (!currentStep) return;

  swap.networkStatusExtraMessage = '';
  swap.networkStatusExtraMessageDetail = '';
  currentStep.networkStatus = PendingSwapNetworkStatus.WaitingForQueue;

  setStorage({
    ...getStorage(),
    swapDetails: swap,
  });

  return {
    swap,
    step: currentStep,
  };
}

export function delay(ms: number): Promise<unknown> {
  return new Promise((res) => setTimeout(res, ms));
}

export const isEvmTransaction = (tx: Transaction): tx is EvmTransaction =>
  tx.type === TransactionType.EVM;

export const isCosmosTransaction = (tx: Transaction): tx is CosmosTransaction =>
  tx.type === TransactionType.COSMOS;
export const isSolanaTransaction = (tx: Transaction): tx is SolanaTransaction =>
  tx.type === TransactionType.SOLANA;
export const isTrasnferTransaction = (
  tx: Transaction
): tx is TransferTransaction => tx.type === TransactionType.TRANSFER;
export const isStarknetTransaction = (
  tx: Transaction
): tx is StarknetTransaction => tx.type === TransactionType.STARKNET;
export const isTronTransaction = (tx: Transaction): tx is TronTransaction =>
  tx.type === TransactionType.TRON;

/**
 *
 * To execute a swap, we are keeping the user prefrences on what wallet they are going to use for a sepecific blockchain
 * By passing the swap and the network we are looking for, it returns the wallet name that user selected.
 *
 */
export const getSwapWalletType = (
  swap: PendingSwap,
  network: Network
): WalletType => {
  return swap.wallets[network]?.walletType;
};

/**
 *
 * We are keeping the connected wallet in a specific structure (`Wallet`),
 * By using this function we normally want to check a specific wallet is connected and exists or not.
 *
 */
export function isWalletNull(wallet: Wallet | null): boolean {
  return (
    wallet === null ||
    wallet?.blockchains === null ||
    wallet?.blockchains.length === 0
  );
}

/**
 * On our implementation for `wallets` package, We keep the instance in 2 ways
 * If it's a single chain wallet, it returns the instance directly,
 * If it's a multichain wallet, it returns a `Map` of instances.
 * This function will get the `ETHEREUM` instance in both types.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getEvmProvider(providers: Providers, type: WalletType): any {
  if (type && providers[type]) {
    // we need this because provider can return an instance or a map of instances, so what you are doing here is try to detect that.
    if (providers[type].size) return providers[type].get(Network.ETHEREUM);

    return providers[type];
  }
  return null;
}

/**
 * In a `PendingSwap`, each step needs a wallet to proceed,
 * By using this function we can access what wallet exactly we need to run current step.
 */
export function getRequiredWallet(swap: PendingSwap): {
  type: WalletType | null;
  network: Network | null;
  address: string | null;
} {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const step = getCurrentStep(swap)!;
  const bcName = getCurrentBlockchainOfOrNull(swap, step);
  if (!bcName) {
    return {
      type: null,
      network: null,
      address: null,
    };
  }

  const walletType = getSwapWalletType(swap, bcName);
  const sourceWallet = swap.wallets[bcName];

  return {
    type: walletType || null,
    network: bcName,
    address: sourceWallet ? sourceWallet.address : null,
  };
}

/**
 * On EVM compatible wallets, There is one instance with different chains (like Polygon)
 * To get the chain from instance we will use this function.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getChainId(provider: any): Promise<string | number | null> {
  const chainId: number | string | null =
    (await provider.request({ method: 'eth_chainId' })) || provider?.chainId;
  return chainId;
}

/**
 * For running a swap safely, we need to make sure about the state of wallet
 * which means the netowrk/chain of wallet should be exactly on what a transaction needs.
 */
export async function isNetworkMatchedForTransaction(
  swap: PendingSwap,
  step: PendingSwapStep,
  wallet: Wallet | null,
  meta: Meta,
  providers: Providers
): Promise<boolean> {
  if (isWalletNull(wallet)) {
    console.warn('wallet object is null');
    return false;
  }
  const fromBlockChain = getCurrentBlockchainOfOrNull(swap, step);
  if (!fromBlockChain) return false;

  if (
    !!meta.evmBasedChains.find(
      (evmBlochain) => evmBlochain.name === fromBlockChain
    )
  ) {
    try {
      const sourceWallet = swap.wallets[fromBlockChain];
      if (sourceWallet) {
        if (
          [
            WalletType.META_MASK,
            WalletType.BINANCE_CHAIN,
            WalletType.XDEFI,
            WalletType.WALLET_CONNECT,
            WalletType.TRUST_WALLET,
            WalletType.COIN98,
            WalletType.EXODUS,
            WalletType.OKX,
            WalletType.COINBASE,
            WalletType.TOKEN_POCKET,
            WalletType.MATH,
            WalletType.SAFEPAL,
            WalletType.COSMOSTATION,
            WalletType.CLOVER,
            WalletType.BRAVE,
          ].includes(sourceWallet.walletType)
        ) {
          const provider = getEvmProvider(providers, sourceWallet.walletType);
          const chainId: number | string | null = await getChainId(provider);
          if (chainId) {
            const blockChain = getBlockChainNameFromId(
              chainId,
              Object.entries(meta.blockchains).map(
                ([, blockchainMeta]) => blockchainMeta
              )
            );
            if (
              blockChain &&
              blockChain.toLowerCase() === fromBlockChain.toLowerCase()
            )
              return true;
            if (
              blockChain &&
              blockChain.toLowerCase() !== fromBlockChain.toLowerCase()
            )
              return false;
          }
        } else {
          return true;
        }
      }
    } catch (e) {
      console.log(e);
    }
    return false;
  }
  return true;
}

/**
 * Returns the wallet address, based on the current step of `PendingSwap`.
 */
export const getCurrentAddressOf = (
  swap: PendingSwap,
  step: PendingSwapStep
): string => {
  const result =
    swap.wallets[step.evmTransaction?.blockChain || ''] ||
    swap.wallets[step.evmApprovalTransaction?.blockChain || ''] ||
    swap.wallets[step.cosmosTransaction?.blockChain || ''] ||
    swap.wallets[step.solanaTransaction?.blockChain || ''] ||
    (step.transferTransaction?.fromWalletAddress
      ? { address: step.transferTransaction?.fromWalletAddress }
      : null) ||
    null;
  if (result == null) throw PrettyError.WalletMissing();
  return result.address;
};

// Todo: Is it same with `getRequiredWallet`?
export function getRelatedWallet(
  swap: PendingSwap,
  currentStep: PendingSwapStep
): WalletTypeAndAddress {
  const walletAddress = getCurrentAddressOf(swap, currentStep);
  const walletKV =
    Object.keys(swap.wallets)
      .map((k) => ({ k, v: swap.wallets[k] }))
      .find(({ v }) => v.address === walletAddress) || null;
  const blockchain = walletKV?.k || null;
  const wallet = walletKV?.v || null;

  const walletType = wallet?.walletType;
  if (walletType === WalletType.UNKNOWN || wallet === null)
    throw PrettyError.AssertionFailed(
      `Wallet for source ${blockchain} not passed to transfer: walletType: ${walletType}`
    );
  return wallet;
}

export const isTxAlreadyCreated = (
  swap: PendingSwap,
  step: PendingSwapStep
): boolean => {
  const result =
    swap.wallets[step.evmTransaction?.blockChain || ''] ||
    swap.wallets[step.evmApprovalTransaction?.blockChain || ''] ||
    swap.wallets[step.cosmosTransaction?.blockChain || ''] ||
    swap.wallets[step.solanaTransaction?.blockChain || ''] ||
    step.transferTransaction?.fromWalletAddress ||
    null;

  return result !== null;
};

export function resetNetworkStatus(
  actions: ExecuterActions<SwapStorage, SwapActionTypes, SwapQueueContext>
): void {
  const { getStorage, setStorage } = actions;
  const swap = getStorage().swapDetails;
  const currentStep = getCurrentStep(swap);

  if (currentStep?.networkStatus) {
    currentStep.networkStatus = null;
    setStorage({ ...getStorage(), swapDetails: swap });
  }
}

export function updateNetworkStatus(
  actions: ExecuterActions<SwapStorage, SwapActionTypes, SwapQueueContext>,
  data: {
    message: string;
    details: string;
    status: PendingSwapNetworkStatus | null;
  } = {
    message: '',
    details: '',
    status: null,
  }
): void {
  const { message, details, status } = data;
  const { getStorage, setStorage } = actions;
  const swap = getStorage().swapDetails;
  const currentStep = getCurrentStep(swap);

  if (currentStep?.networkStatus) {
    swap.networkStatusExtraMessage = message;
    swap.networkStatusExtraMessageDetail = details;
    currentStep.networkStatus = status;
    setStorage({ ...getStorage(), swapDetails: swap });
  }
}

/**
 * Event handler for blocked tasks.
 * If a transcation execution is manually blocked (like for parallel or waiting for walle),
 * This function will be called by queue manager using `queue definition`.
 *
 * It checks if the required wallet is connected, unblock the queue to be run.
 */
export function onBlockForConnectWallet(
  event: WhenTaskBlockedEvent,
  meta: WhenTaskBlockedMeta
): void {
  const { context, queue } = meta;
  const swap = queue.getStorage().swapDetails as SwapStorage['swapDetails'];

  if (!isRequiredWalletConnected(swap, context.state)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const currentStep = getCurrentStep(swap)!;
    context.notifier({
      eventType: 'waiting_for_connecting_wallet',
      swap: swap,
      step: currentStep,
    });

    markRunningSwapAsWaitingForConnectingWallet(
      {
        getStorage: queue.getStorage.bind(queue),
        setStorage: queue.setStorage.bind(queue),
      },
      ERROR_MESSAGE_WAIT_FOR_WALLET,
      event.reason.description
    );

    return;
  }

  queue.unblock();
}

/**
 * Event handler for blocked tasks.
 * If a transcation execution is manually blocked (like for parallel or waiting for walle),
 * This function will be called by queue manager using `queue definition`.
 *
 * It checks if the required network is connected, unblock the queue to be run.
 * Note: it automatically try to switch the network if its `provider` supports.
 */
export function onBlockForChangeNetwork(
  _event: WhenTaskBlockedEvent,
  meta: WhenTaskBlockedMeta
): void {
  const { context, queue } = meta;
  const swap = queue.getStorage().swapDetails as SwapStorage['swapDetails'];
  const currentStep = getCurrentStep(swap);

  if (!currentStep) return;

  const result = markRunningSwapAsSwitchingNetwork({
    getStorage: queue.getStorage.bind(queue),
    setStorage: queue.setStorage.bind(queue),
  });

  if (result) {
    context.notifier({
      eventType: 'waiting_for_network_change',
      swap: result.swap,
      step: result.step,
    });
  }

  // Try to auto switch
  const { type, network } = getRequiredWallet(swap);
  if (!!type && !!network) {
    const result = context.switchNetwork(type, network);
    if (result) {
      result.then(() => {
        queue.unblock();
      });
    }
  }
}

/**
 * Event handler for blocked tasks. (Parallel mode)
 * If a transcation execution is manually blocked (like for parallel or waiting for walle),
 * This function will be called by queue manager using `queue definition`.
 *
 * It checks the blocked tasks, if there is no active `claimed` queue, try to give it to the best candidate.
 */
export function onDependsOnOtherQueues(
  _event: WhenTaskBlockedEvent,
  meta: WhenTaskBlockedMeta
): void {
  const { getBlockedTasks, forceExecute, queue, manager } = meta;
  const { setClaimer, claimedBy, reset } = claimQueue();

  // We only needs those blocked tasks that have DEPENDS_ON_OTHER_QUEUES reason.
  const blockedTasks = getBlockedTasks().filter(
    (task) => task.reason.reason === BlockReason.DEPENDS_ON_OTHER_QUEUES
  );

  if (blockedTasks.length === 0) {
    return;
  }

  const claimerId = claimedBy();
  const isClaimedByAnyQueue = !!claimerId;

  // Check if any queue `claimed` before, if yes, we don't should do anything.
  if (isClaimedByAnyQueue) {
    // We need to keep the latest swap messages
    markRunningSwapAsDependsOnOtherQueues({
      getStorage: queue.getStorage.bind(queue),
      setStorage: queue.setStorage.bind(queue),
    });
    return;
  }

  // Prioritize current queue to be run first.

  let task = blockedTasks.find((task) => {
    return task.queue_id === meta.queue_id;
  });

  // If current task isn't available anymore, fallback to first blocked task.
  if (!task) {
    const firstBlockedTask = blockedTasks[0];
    task = firstBlockedTask;
  }

  setClaimer(task.queue_id);
  const claimedStorage = task.storage.get() as SwapStorage;
  const { type, network, address } = getRequiredWallet(
    claimedStorage.swapDetails
  );

  // Run
  forceExecute(task.queue_id, {
    claimedBy: claimedBy(),
    resetClaimedBy: () => {
      reset();
      // TODO: Use key generator
      retryOn(`${type}-${network}-${address}`, manager);
    },
  });
}

export function isRequiredWalletConnected(
  swap: PendingSwap,
  getState: (type: WalletType) => WalletState
): boolean {
  const { type, address } = getRequiredWallet(swap);
  if (!type || !address) {
    return false;
  }
  const walletState = getState(type);
  const { accounts } = walletState;
  const connectedAccounts = accounts || [];

  return connectedAccounts.some((account) => {
    const { address: accountAddress } = readAccountAddress(account);
    return address === accountAddress;
  });
}

export function singTransaction(
  actions: ExecuterActions<SwapStorage, SwapActionTypes, SwapQueueContext>
): void {
  const { getStorage, setStorage, failed, next, schedule, context } = actions;
  const { meta, getSigners, notifier } = context;
  const swap = getStorage().swapDetails;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const currentStep = getCurrentStep(swap)!;
  const {
    evmTransaction,
    evmApprovalTransaction,
    cosmosTransaction,
    solanaTransaction,
    transferTransaction,
  } = currentStep;
  const sourceWallet = getRelatedWallet(swap, currentStep);
  const walletSigners = getSigners(sourceWallet.walletType);
  const onFinish = () => {
    if (actions.context.resetClaimedBy) {
      actions.context.resetClaimedBy();
    }
  };

  if (!!evmApprovalTransaction) {
    const spenderContract = evmApprovalTransaction?.to;

    if (!spenderContract)
      throw PrettyError.AssertionFailed(
        'contract address is null for checking approval'
      );

    // Update swap status
    const message = `waiting for approval of ${currentStep?.fromSymbol} coin ${
      sourceWallet.walletType === WalletType.WALLET_CONNECT
        ? 'on your mobile phone'
        : ''
    }`;
    const updateResult = updateSwapStatus({
      getStorage,
      setStorage,
      nextStepStatus: 'waitingForApproval',
      message,
      details:
        'Waiting for approve transaction to be mined and confirmed successfully',
    });
    notifier({
      eventType: 'confirm_contract',
      ...updateResult,
    });

    // Execute transaction
    walletSigners.executeEvmTransaction(evmApprovalTransaction, meta).then(
      (hash) => {
        console.debug('transaction of approval minted successfully', hash);
        const approveUrl = getEvmApproveUrl(
          hash,
          getCurrentBlockchainOf(swap, currentStep),
          meta.evmBasedChains
        );
        currentStep.explorerUrl = [
          ...(currentStep.explorerUrl || []),
          {
            url: approveUrl,
            description: `approve`,
          },
        ];

        // `currentStep` has been mutated, let's update storage.
        setStorage({
          ...getStorage(),
          swapDetails: swap,
        });
        schedule(SwapActionTypes.CHECK_TRANSACTION_STATUS);
        next();
        onFinish();
      },

      (error) => {
        if (swap.status === 'failed') return;
        console.debug('error in approving', error);
        const { extraMessage, extraMessageDetail, extraMessageErrorCode } =
          prettifyErrorMessage(error);
        if (
          error &&
          error?.root &&
          error?.root?.message &&
          error?.root?.code &&
          error?.root?.reason
        ) {
          logRPCError(error.root, swap, currentStep, sourceWallet?.walletType);
        }

        const updateResult = updateSwapStatus({
          getStorage,
          setStorage,
          nextStatus: 'failed',
          nextStepStatus: 'failed',
          message: extraMessage,
          details: extraMessageDetail,
          errorCode: extraMessageErrorCode,
        });
        notifier({
          eventType: 'contract_rejected',
          ...updateResult,
        });

        failed();
        onFinish();
      }
    );
    return;
  }

  const executeMessage = 'executing transaction';
  const executeDetails = `${
    sourceWallet.walletType === WalletType.WALLET_CONNECT
      ? 'Check your mobile phone'
      : ''
  }`;

  if (!!transferTransaction) {
    const updateResult = updateSwapStatus({
      getStorage,
      setStorage,
      nextStepStatus: 'running',
      message: executeMessage,
      details: executeDetails,
    });
    notifier({
      eventType: 'confirm_transfer',
      ...updateResult,
    });

    walletSigners.executeTransfer(transferTransaction, meta).then(
      (txId) => {
        setStepTransactionIds(actions, txId, 'transfer_confirmed', notifier);
        schedule(SwapActionTypes.CHECK_TRANSACTION_STATUS);
        next();
        onFinish();
      },
      (error) => {
        if (swap.status === 'failed') return;
        const { extraMessage, extraMessageDetail, extraMessageErrorCode } =
          prettifyErrorMessage(error);
        const updateResult = updateSwapStatus({
          getStorage,
          setStorage,
          nextStatus: 'failed',
          nextStepStatus: 'failed',
          message: extraMessage,
          details: extraMessageDetail,
          errorCode: extraMessageErrorCode,
        });
        notifier({
          eventType: 'transfer_rejected',
          ...updateResult,
        });
        failed();
        onFinish();
      }
    );
  } else if (!!evmTransaction) {
    const updateResult = updateSwapStatus({
      getStorage,
      setStorage,
      nextStepStatus: 'running',
      message: executeMessage,
      details: executeDetails,
    });
    notifier({
      eventType: 'calling_smart_contract',
      ...updateResult,
    });

    walletSigners.executeEvmTransaction(evmTransaction, meta).then(
      (id) => {
        setStepTransactionIds(actions, id, 'smart_contract_called', notifier);
        schedule(SwapActionTypes.CHECK_TRANSACTION_STATUS);
        next();
        onFinish();
      },
      (error) => {
        if (swap.status === 'failed') return;
        const { extraMessage, extraMessageDetail, extraMessageErrorCode } =
          prettifyErrorMessage(error);
        if (
          error &&
          error?.root &&
          error?.root?.message &&
          error?.root?.code &&
          error?.root?.reason
        ) {
          logRPCError(error.root, swap, currentStep, sourceWallet?.walletType);
        }
        const updateResult = updateSwapStatus({
          getStorage,
          setStorage,
          nextStatus: 'failed',
          nextStepStatus: 'failed',
          message: extraMessage,
          details: extraMessageDetail,
          errorCode: extraMessageErrorCode,
        });
        notifier({
          eventType: 'smart_contract_call_failed',
          ...updateResult,
        });

        failed();
        onFinish();
      }
    );
  } else if (!!cosmosTransaction) {
    const updateResult = updateSwapStatus({
      getStorage,
      setStorage,
      nextStepStatus: 'running',
      message: executeMessage,
      details: executeDetails,
    });
    notifier({
      eventType: 'calling_smart_contract',
      ...updateResult,
    });

    // If keplr wallet is executing contracts on terra, throw error. keplr doesn't support transfer or execute contracts. only IBC messages are supported
    if (
      (currentStep?.swapperId.toString() === 'TerraSwap' ||
        (currentStep?.swapperId.toString() === 'ThorChain' &&
          currentStep?.fromBlockchain === Network.TERRA) ||
        (currentStep?.swapperId.toString() === 'Terra Bridge' &&
          currentStep.fromBlockchain === Network.TERRA)) && // here we must allow ibc on terrastatus
      sourceWallet.walletType === WalletType.KEPLR
    ) {
      const { extraMessage, extraMessageDetail, extraMessageErrorCode } =
        prettifyErrorMessage(
          'Keplr only supports IBC Transactions on Terra. ' +
            'Using Terra Bridge, TerraSwap and THORChain is not possible with Keplr. Please use TerraStation or Leap wallet'
        );
      const updateResult = updateSwapStatus({
        getStorage,
        setStorage,
        nextStatus: 'failed',
        nextStepStatus: 'failed',
        message: extraMessage,
        details: extraMessageDetail,
        errorCode: extraMessageErrorCode,
      });
      notifier({
        eventType: 'smart_contract_call_failed',
        ...updateResult,
      });
      failed();
      onFinish();
      return;
    }

    walletSigners.executeCosmosMessage(cosmosTransaction, meta).then(
      // todo
      (id: string | null) => {
        setStepTransactionIds(actions, id, 'smart_contract_called', notifier);
        schedule(SwapActionTypes.CHECK_TRANSACTION_STATUS);
        next();
        onFinish();
      },
      (error: string | null) => {
        if (swap.status === 'failed') return;
        const { extraMessage, extraMessageDetail, extraMessageErrorCode } =
          prettifyErrorMessage(error);
        const updateResult = updateSwapStatus({
          getStorage,
          setStorage,
          nextStatus: 'failed',
          nextStepStatus: 'failed',
          message: extraMessage,
          details: extraMessageDetail,
          errorCode: extraMessageErrorCode,
        });
        notifier({
          eventType: 'smart_contract_call_failed',
          ...updateResult,
        });
        failed();
        onFinish();
      }
    );
  } else if (!!solanaTransaction) {
    const updateResult = updateSwapStatus({
      getStorage,
      setStorage,
      nextStepStatus: 'running',
      message: executeMessage,
      details: executeDetails,
    });
    notifier({
      eventType: 'calling_smart_contract',
      ...updateResult,
    });

    const tx = solanaTransaction;
    walletSigners.executeSolanaTransaction(tx, swap.requestId).then(
      (txId) => {
        setStepTransactionIds(actions, txId, 'smart_contract_called', notifier);
        schedule(SwapActionTypes.CHECK_TRANSACTION_STATUS);
        next();
        onFinish();
      },
      (error) => {
        if (swap.status === 'failed') return;
        const { extraMessage, extraMessageDetail, extraMessageErrorCode } =
          prettifyErrorMessage(error);
        const updateResult = updateSwapStatus({
          getStorage,
          setStorage,
          nextStatus: 'failed',
          nextStepStatus: 'failed',
          message: extraMessage,
          details: extraMessageDetail,
          errorCode: extraMessageErrorCode,
        });
        notifier({
          eventType: 'smart_contract_call_failed',
          ...updateResult,
        });
        failed();
        onFinish();
      }
    );
  }
}

export function checkWaitingForConnectWalletChange(params: {
  wallet_network: string;
  manager?: Manager;
  evmChains: EvmBlockchainMeta[];
}): void {
  const { wallet_network, evmChains, manager } = params;
  const [wallet, network] = wallet_network.split('-');

  // We only need change network for EVM chains.
  if (!evmChains.some((chain) => chain.name == network)) return;

  manager?.getAll().forEach((q) => {
    const queueStorage = q.list.getStorage() as SwapStorage | undefined;
    const swap = queueStorage?.swapDetails;
    if (swap) {
      const currentStep = getCurrentStep(swap);
      if (currentStep) {
        const currentStepRequiredWallet =
          queueStorage?.swapDetails.wallets[currentStep.fromBlockchain]
            ?.walletType;
        const hasWaitingForConnect = Object.keys(q.list.state.tasks).some(
          (taskId) => {
            const task = q.list.state.tasks[taskId];
            return (
              task.status === Status.BLOCKED &&
              [BlockReason.WAIT_FOR_CONNECT_WALLET].includes(
                task.blockedFor?.reason
              )
            );
          }
        );

        if (currentStepRequiredWallet === wallet && hasWaitingForConnect) {
          const queueInstance = q.list;
          const swap = queueInstance.getStorage()
            ?.swapDetails as SwapStorage['swapDetails'];
          const { type } = getRequiredWallet(swap);
          const description = ERROR_MESSAGE_WAIT_FOR_CHANGE_NETWORK(type);

          q.list.block({
            reason: {
              reason: BlockReason.WAIT_FOR_NETWORK_CHANGE,
              description,
            },
            silent: true,
          });

          markRunningSwapAsSwitchingNetwork({
            getStorage: queueInstance.getStorage.bind(queueInstance),
            setStorage: queueInstance.setStorage.bind(queueInstance),
          });
        }
      }
    }
  });
}

export function checkWaitingForNetworkChange(manager?: Manager): void {
  manager?.getAll().forEach((q) => {
    const hasWaitingForNetwork = Object.keys(q.list.state.tasks).some(
      (taskId) => {
        const task = q.list.state.tasks[taskId];
        return (
          task.status === Status.BLOCKED &&
          [
            BlockReason.WAIT_FOR_NETWORK_CHANGE,
            BlockReason.DEPENDS_ON_OTHER_QUEUES,
          ].includes(task.blockedFor?.reason)
        );
      }
    );

    if (hasWaitingForNetwork) {
      const swap = q.list.getStorage()
        ?.swapDetails as SwapStorage['swapDetails'];
      const { type } = getRequiredWallet(swap);
      const description = ERROR_MESSAGE_WAIT_FOR_WALLET_DESCRIPTION(type);

      // Change the block reason to waiting for connecting wallet
      q.list.block({
        reason: {
          reason: BlockReason.WAIT_FOR_CONNECT_WALLET,
          description,
        },
      });
    }
  });
}

/**
 *
 * Try to run blocked tasks by wallet and network name.
 * Goes through queues and extract blocked queues with matched wallet.
 * If found any blocked tasks with same wallet and network, runs them.
 * If not, runs only blocked tasks with matched wallet.
 *
 * @param wallet_network a string includes `wallet` type and `network` type.
 * @param manager
 * @returns
 */
export function retryOn(
  wallet_network: string,
  manager?: Manager,
  options = { fallbackToOnlyWallet: true }
): void {
  const [wallet, network] = wallet_network.split('-');
  if (!wallet || !network) {
    return;
  }

  const walletAndNetworkMatched: QueueType[] = [];
  const onlyWalletMatched: QueueType[] = [];

  manager?.getAll().forEach((q) => {
    // retry only on affected queues
    if (q.status === Status.BLOCKED) {
      const queueStorage = q.list.getStorage() as SwapStorage | undefined;
      const swap = queueStorage?.swapDetails;

      if (swap) {
        const currentStep = getCurrentStep(swap);
        if (currentStep) {
          if (
            currentStep.fromBlockchain == network &&
            queueStorage?.swapDetails.wallets[network]?.walletType === wallet
          ) {
            walletAndNetworkMatched.push(q.list);
          } else if (
            queueStorage?.swapDetails.wallets[currentStep.fromBlockchain]
              ?.walletType === wallet
          ) {
            onlyWalletMatched.push(q.list);
          }
        }
      }
    }
  });

  // const isWaitingForConnectWallet = (status: Status) =>
  let finalQueueToBeRun: QueueType | undefined = undefined;
  if (walletAndNetworkMatched.length > 0) {
    finalQueueToBeRun = walletAndNetworkMatched[0];

    if (walletAndNetworkMatched.length > 1) {
      for (let i = 1; i < walletAndNetworkMatched.length; i++) {
        const currentQueue = walletAndNetworkMatched[i];

        markRunningSwapAsDependsOnOtherQueues({
          getStorage: currentQueue.getStorage.bind(currentQueue),
          setStorage: currentQueue.setStorage.bind(currentQueue),
        });
      }
    }
  } else if (onlyWalletMatched.length > 0 && options.fallbackToOnlyWallet) {
    finalQueueToBeRun = onlyWalletMatched[0];
  }

  finalQueueToBeRun?.checkBlock();
}

/* 
  For avoiding conflict by making too many requests to wallet, we need to make sure
  We only run one request at a time (In parallel mode).
  */
export function isNeedBlockQueueForParallel(step: PendingSwapStep): boolean {
  return (
    !!step.evmTransaction ||
    !!step.evmApprovalTransaction ||
    !!step.cosmosTransaction
  );
}