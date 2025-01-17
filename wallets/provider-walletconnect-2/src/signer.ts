import type { WCInstance } from './types.js';
import type { SignerFactory } from 'rango-types';

import { DefaultSignerFactory, TransactionType as TxType } from 'rango-types';

import COSMOSSigner from './signers/cosmos.js';
import EVMSigner from './signers/evm.js';
import SOLANASigner from './signers/solana.js';

export default function getSigners(instance: WCInstance): SignerFactory {
  if (!instance.session) {
    throw new Error('Session is required for wallet connect signers.');
  }

  const signers = new DefaultSignerFactory();
  signers.registerSigner(
    TxType.EVM,
    new EVMSigner(instance.client, instance.session)
  );
  signers.registerSigner(
    TxType.COSMOS,
    new COSMOSSigner(instance.client, instance.session)
  );
  signers.registerSigner(
    TxType.SOLANA,
    new SOLANASigner(instance.client, instance.session)
  );

  return signers;
}
