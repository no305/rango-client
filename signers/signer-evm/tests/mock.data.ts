import { EvmTransaction, TransactionType } from 'rango-types/lib/api/main';
export const address = '0x17ec8597ff92C3F44523bDc65BF0f1bE632917ff';
export const privateKey =
  'de926db3012af759b4f24b5a51ef6afa397f04670f634aa4f48d4480417007f3';

export const EVM_TX: EvmTransaction = {
  type: TransactionType.EVM,
  blockChain: 'ETH',
  isApprovalTx: false,
  from: address,
  to: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
  data: '0xb17d0e6e0000000000000000000000000000000017cd96c9a71941e692ae0a7241bd5c250000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb480000000000000000000000000000000000000000000000000046f9e29952a000000000000000000000000000000000000000000000000000000001d1a94a20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000012309ce540000000000000000000000000002702d89c1c8658b49c45dd460deebcc45faec03c0000000000000000000000000000000000000000000000000000000002400738000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000001a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005423e28219d6d568dcf62a8134d623e6f4a1c2df000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000001111111254eeb25477b68fb85ed929f73a9605820000000000000000000000001111111254eeb25477b68fb85ed929f73a9605820000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb4800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000046f9e29952a00000000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000000c80502b1c500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000046f9e29952a00000000000000000000000000000000000000000000000000000000000024007380000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000180000000000000003b6d0340b4e16d0168e52d35cacd2c6185b44281ec28c9dc95e51660000000000000000000000000000000000000000000000000',
  value: '0x470de4df820000',
  gasLimit: '0x49329',
  gasPrice: null,
  maxPriorityFeePerGas: '2342363475',
  maxFeePerGas: '25832357338',
  nonce: null,
};