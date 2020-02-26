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
} from "./interfaces";

export class OperationDetails {
  constructor(public didOperations: Map<string,string[]>, public otherOperations: string[]){}
}

export const formatMorpheusSignableOperation = (operation: ISignableOperationData): string[] => {
  const signable = (operation as unknown) as ISignableOperationData;
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

  for(const attempt of asset.operationAttempts) {
    if(attempt.operation === OperationType.Signed) {
      for(const signable of (attempt as ISignedOperationsData).signables) {
        if(
          signable.operation === SignableOperationType.AddKey ||
          signable.operation === SignableOperationType.RevokeKey
        ) {
          const did = (signable as IAddKeyData).did;
          if(!didOperations.has(did)){
            didOperations.set(did, []);
          }
          didOperations.get(did).push(signable.operation);
        }
        else if(
          signable.operation === SignableOperationType.AddRight ||
          signable.operation === SignableOperationType.RevokeRight
        ) {
          const did = (signable as IAddRightData).did;
          if(!didOperations.has(did)){
            didOperations.set(did, []);
          }
          didOperations.get(did).push(`${signable.operation} / ${(signable as IAddRightData).right}`);
        }
        else if(signable.operation === SignableOperationType.TombstoneDid) {
          const did = (signable as ITombstoneDidData).did;
          if(!didOperations.has(did)){
            didOperations.set(did, []);
          }
          didOperations.get(did).push(signable.operation);
        }
        else {
          otherOperations.push(signable.operation);
        }
      }
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

const formatUndefined = (value: string | number | undefined) => {
  if(!value) {
    return '-';
  }
  return value;
}