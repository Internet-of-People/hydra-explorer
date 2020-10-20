import {
  IMorpheusAsset,
  OperationType,
  ISignedOperationsData,
  SignableOperationType,
  IAddKeyData,
  IAddRightData,
  ITombstoneDidData,
  ISignableOperationData,
  IRevokeKeyData,
  IRevokeRightData,
  IRegisterBeforeProofData,
  TxStatus,
} from "./interfaces";

export class OperationDetails {
  constructor(
    public readonly didOperations: Map<string,string[]>,
    public readonly otherOperations: string[]
  ) {
  }

  public get didOperationsCount(): number {
    let count = 0;
    for (const [_did, ops] of this.didOperations.entries()) {
      count += ops.length;
    }
    return count;
  }

  public get otherOperationsCount(): number {
    return this.otherOperations.length;
  }
}

export const formatMorpheusSignableOperation = (signable: ISignableOperationData): string[] => {
  if(signable.operation === SignableOperationType.AddKey) {
    return [
      signable.operation,
      `Key: ${(signable as IAddKeyData).auth}`,
      `Expires: ${formatUndefined((signable as IAddKeyData).expiresAtHeight)}`
    ];
  }
  else if(signable.operation === SignableOperationType.RevokeKey) {
    return [
      signable.operation,
      `Key: ${(signable as IRevokeKeyData).auth}`,
    ];
  }
  else if(signable.operation === SignableOperationType.AddRight) {
    return [
      signable.operation,
      `Right: ${(signable as IAddRightData).right}`,
      `To Key: ${(signable as IAddRightData).auth}`,
    ];
  }
  else if(signable.operation === SignableOperationType.RevokeRight) {
    return [
      signable.operation,
      `Right: ${(signable as IRevokeRightData).right}`,
      `From Key: ${(signable as IRevokeRightData).auth}`,
    ];
  }
  else {
    return [signable.operation];
  }
}

export const formatMorpheusOperations = (asset: IMorpheusAsset): OperationDetails => {
  const didOperations: Map<string,string[]> = new Map();
  const otherOperations = [];

  if(!asset) {
    return new OperationDetails(didOperations, otherOperations);
  }

  const addDidOp = (did: string, operation: string): void => {
    if(!didOperations.has(did)){
      didOperations.set(did, []);
    }
    didOperations.get(did).push(operation);
  }

  for (const attempt of asset.operationAttempts) {
    if (attempt.operation === OperationType.Signed) {
      for (const signable of (attempt as ISignedOperationsData).signables) {
        if (signable.operation === SignableOperationType.AddKey) {
          const { did, auth, expiresAtHeight } = signable as IAddKeyData;
          const expiration = expiresAtHeight ? ` (expires at ${expiresAtHeight})` : ''
          addDidOp(did, `Added key ${auth}${expiration}`);
        }
        else if (signable.operation === SignableOperationType.RevokeKey) {
          const { did, auth } = signable as IRevokeKeyData;
          addDidOp(did, `Revoked key ${auth}`);
        }
        else if (signable.operation === SignableOperationType.AddRight) {
          const { did, right, auth } = signable as IAddRightData;
          addDidOp(did, `Added '${right}' right to key ${auth}`);
        }
        else if (signable.operation === SignableOperationType.RevokeRight) {
          const { did, right, auth } = signable as IRevokeRightData;
          addDidOp(did, `Revoked '${right}' right from key ${auth}`);
        }
        else if (signable.operation === SignableOperationType.TombstoneDid) {
          const { did } = signable as ITombstoneDidData;
          addDidOp(did, `Tombstoned DID`);
        }
        else {
          addDidOp(signable.did, signable.operation)
        }
      }
    }
    else if (attempt.operation == OperationType.RegisterBeforeProof) {
      const { contentId } = attempt as IRegisterBeforeProofData;
      otherOperations.push(`Registered content ${contentId}`);
    }
    else {
      otherOperations.push(attempt.operation);
    }
  }

  return new OperationDetails(didOperations, otherOperations);
};

export const isMorpheusTransaction = (type: number, typeGroup: number): boolean => {
  return typeGroup === 4242 && type === 1;
};

export const isCoeusTransaction = (type: number, typeGroup: number): boolean => {
  return typeGroup === 4242 && type === 2;
};

export const isIOPTransaction = (typeGroup: number): boolean => {
  return typeGroup === 4242;
};

const formatUndefined = (value: string | number | undefined) => {
  if(!value) {
    return '-';
  }
  return value;
};

export const buildTxStatusesMap = (txs: string[], results: any[]): Map<string,TxStatus> => {
  const map = new Map<string, TxStatus>();
    for(let i=0;i<txs.length;i++){
      const txId = txs[i];

      for(const result of results) {
        if(result.config && result.config.url.endsWith(txId)) {
          map.set(txId, result.data ? TxStatus.CONFIRMED : TxStatus.REJECTED);
          break;
        }
      }

      if(!map.has(txId)) {
        map.set(txId,TxStatus.NOT_FOUND);
      }
    }

    return map;
};